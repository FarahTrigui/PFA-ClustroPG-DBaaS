import socket
import psycopg2
import boto3
from flask import Flask, render_template, request, jsonify
import os
import shutil
import random
from flask_cors import CORS
import kubernetes.client
from kubernetes import config
import subprocess
import time
from prometheus_api_client import PrometheusConnect
import base64

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])

# Initialize Kubernetes client at module level
try:
    config.load_kube_config()
    kubernetes_client = kubernetes.client.CoreV1Api()
    prom = PrometheusConnect(url="http://localhost:9090", disable_ssl=True)
except Exception as e:
    print(f"Failed to initialize Kubernetes client: {str(e)}")
    kubernetes_client = None

def base64_decode(encoded_str):
    return base64.b64decode(encoded_str).decode('utf-8')

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def find_available_port():
    """Find an available port between 15432-15532"""
    for port in range(15432, 15532):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(('localhost', port)) != 0:
                return port
    raise RuntimeError("No available ports found")


@app.route('/get-table-structure', methods=['GET'])
def get_table_structure():
    cluster = request.args.get('cluster')
    table = request.args.get('table')
    
    if not cluster or not table:
        return jsonify({'error': 'Missing cluster or table name'}), 400

    try:
        # Clean up any existing port-forwards
        subprocess.run(["pkill", "-f", f"kubectl port-forward.*{cluster}"], 
                      stderr=subprocess.DEVNULL)
        time.sleep(1)
        
        local_port = 15432 + hash(cluster) % 1000
        service_name = f"{cluster}-rw" if not cluster.endswith("-rw") else cluster
        
        port_forward = subprocess.Popen(
            ["kubectl", "port-forward", f"svc/{service_name}", f"{local_port}:5432"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        time.sleep(2)

        secret_name = f"{cluster.split('-rw')[0]}-app" if cluster.endswith("-rw") else f"{cluster}-app"
        secret = kubernetes_client.read_namespaced_secret(secret_name, "default")
        password = base64_decode(secret.data['password'])

        with psycopg2.connect(
            host="localhost",
            port=local_port,
            user="app",
            password=password,
            dbname="app",
            connect_timeout=5
        ) as conn:
            with conn.cursor() as cur:
                # Get column information
                cur.execute(f"""
                    SELECT column_name, data_type 
                    FROM information_schema.columns 
                    WHERE table_name = '{table}';
                """)
                columns = [{'name': row[0], 'type': row[1]} for row in cur.fetchall()]
                
                return jsonify({
                    'status': 'success',
                    'columns': columns
                })

    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e),
            'troubleshooting': f"Verify table exists: kubectl exec -it {cluster}-0 -- psql -U app -c '\\d {table}'"
        }), 500
        
    finally:
        if 'port_forward' in locals() and port_forward.poll() is None:
            port_forward.terminate()

@app.route('/add-table-row', methods=['POST'])
def add_table_row():
    data = request.get_json()
    cluster = data.get('cluster')
    table = data.get('table')
    values = data.get('values')
    
    if not all([cluster, table, values]):
        return jsonify({'error': 'Missing required parameters'}), 400

    try:
        # Clean up any existing port-forwards
        subprocess.run(["pkill", "-f", f"kubectl port-forward.*{cluster}"], 
                      stderr=subprocess.DEVNULL)
        time.sleep(1)
        
        local_port = 15432 + hash(cluster) % 1000
        service_name = f"{cluster}-rw" if not cluster.endswith("-rw") else cluster
        
        port_forward = subprocess.Popen(
            ["kubectl", "port-forward", f"svc/{service_name}", f"{local_port}:5432"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        time.sleep(2)

        secret_name = f"{cluster.split('-rw')[0]}-app" if cluster.endswith("-rw") else f"{cluster}-app"
        secret = kubernetes_client.read_namespaced_secret(secret_name, "default")
        password = base64_decode(secret.data['password'])

        with psycopg2.connect(
            host="localhost",
            port=local_port,
            user="app",
            password=password,
            dbname="app",
            connect_timeout=5
        ) as conn:
            with conn.cursor() as cur:
                # Build the INSERT query
                columns = ', '.join(values.keys())
                placeholders = ', '.join(['%s'] * len(values))
                query = f"INSERT INTO {table} ({columns}) VALUES ({placeholders})"
                
                cur.execute(query, list(values.values()))
                conn.commit()
                
                return jsonify({
                    'status': 'success',
                    'message': 'Row added successfully',
                    'table': table
                })

    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e),
            'query': query,
            'values': values
        }), 500
        
    finally:
        if 'port_forward' in locals() and port_forward.poll() is None:
            port_forward.terminate()


@app.route('/create-table', methods=['POST'])
def create_table():
    data = request.get_json()
    cluster = data.get('cluster')
    table_name = data.get('table_name')
    columns = data.get('columns')  # List of column definitions
    
    if not all([cluster, table_name, columns]):
        return jsonify({'error': 'Missing required parameters'}), 400

    try:
        # Clean up any existing port-forwards
        subprocess.run(["pkill", "-f", f"kubectl port-forward.*{cluster}"], 
                      stderr=subprocess.DEVNULL)
        time.sleep(1)
        
        # Use a dedicated port for this cluster
        local_port = 15432 + hash(cluster) % 1000
        
        # Start port-forward
        service_name = f"{cluster}-rw" if not cluster.endswith("-rw") else cluster
        port_forward = subprocess.Popen(
            ["kubectl", "port-forward", f"svc/{service_name}", f"{local_port}:5432"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        time.sleep(2)

        # Get credentials
        secret_name = f"{cluster.split('-rw')[0]}-app" if cluster.endswith("-rw") else f"{cluster}-app"
        secret = kubernetes_client.read_namespaced_secret(secret_name, "default")
        password = base64_decode(secret.data['password'])

        # Connect and create table
        with psycopg2.connect(
            host="localhost",
            port=local_port,
            user="app",
            password=password,
            dbname="app",
            connect_timeout=5
        ) as conn:
            with conn.cursor() as cur:
                # Create table with provided columns
                column_defs = ", ".join(columns)
                create_sql = f"CREATE TABLE {table_name} ({column_defs});"
                cur.execute(create_sql)
                conn.commit()
                
                return jsonify({
                    'status': 'success',
                    'message': f'Table {table_name} created successfully',
                    'table_name': table_name
                })

    except psycopg2.Error as e:
        return jsonify({
            'status': 'error',
            'error': str(e),
            'sql': create_sql,
            'troubleshooting': [
                f"Verify permissions: kubectl exec -it {cluster}-0 -- psql -U postgres -c 'GRANT CREATE ON SCHEMA public TO app'",
                "Check if table already exists"
            ]
        }), 500
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500
        
    finally:
        if 'port_forward' in locals() and port_forward.poll() is None:
            port_forward.terminate()
@app.route('/get-tables', methods=['GET'])
def get_tables():
    cluster = request.args.get('cluster')
    if not cluster:
        return jsonify({'error': 'Missing cluster name', 'tables': []}), 400

    try:
        # Ensure consistent service name
        service_name = f"{cluster}-rw" if not cluster.endswith("-rw") else cluster
        
        # Start port-forward
        local_port = 15432
        subprocess.run(["pkill", "-f", f"kubectl port-forward.*{cluster}"], 
                      stderr=subprocess.DEVNULL)
        
        port_forward = subprocess.Popen(
            ["kubectl", "port-forward", f"svc/{service_name}", f"{local_port}:5432"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        time.sleep(2)

        # Get connection details
        secret = kubernetes_client.read_namespaced_secret(f"{cluster}-app", "default")
        password = base64_decode(secret.data['password'])

        # Connect to DB
        with psycopg2.connect(
            host="localhost",
            port=local_port,
            user="app",
            password=password,
            dbname="app"
        ) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT table_name FROM information_schema.tables
                    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
                """)
                tables = [row[0] for row in cur.fetchall()] or []
                
                # Always return consistent structure
                return jsonify({
                    'status': 'success',
                    'tables': tables,
                    'cluster': cluster
                })

    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e),
            'tables': [],
            'cluster': cluster
        }), 500
        
    finally:
        if 'port_forward' in locals():
            port_forward.terminate()

@app.route('/get-table-data', methods=['GET'])
def get_table_data():
    cluster = request.args.get('cluster')
    table = request.args.get('table')
    
    if not cluster or not table:
        return jsonify({'error': 'Missing cluster or table name', 'columns': [], 'rows': []}), 400

    try:
        # Clean up any existing port-forwards
        subprocess.run(["pkill", "-f", f"kubectl port-forward.*{cluster}"], 
                      stderr=subprocess.DEVNULL)
        time.sleep(1)
        
        # Use a dedicated port for this cluster
        local_port = 15432 + hash(cluster) % 1000  # Unique port per cluster
        
        # Start port-forward
        service_name = f"{cluster}-rw" if not cluster.endswith("-rw") else cluster
        port_forward = subprocess.Popen(
            ["kubectl", "port-forward", f"svc/{service_name}", f"{local_port}:5432"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        time.sleep(2)  # Wait for connection

        # Get credentials
        secret_name = f"{cluster.split('-rw')[0]}-app" if cluster.endswith("-rw") else f"{cluster}-app"
        secret = kubernetes_client.read_namespaced_secret(secret_name, "default")
        password = base64_decode(secret.data['password'])

        # Connect through port-forward
        with psycopg2.connect(
            host="localhost",
            port=local_port,
            user="app",
            password=password,
            dbname="app",
            connect_timeout=5
        ) as conn:
            with conn.cursor() as cur:
                cur.execute(f"SELECT * FROM {table} LIMIT 100;")
                rows = cur.fetchall()
                columns = [desc[0] for desc in cur.description] if cur.description else []
                
                return jsonify({
                    'status': 'success',
                    'columns': columns,
                    'rows': rows,
                    'table': table
                })

    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e),
            'columns': [],
            'rows': [],
            'table': table,
            'troubleshooting': [
                f"Verify table exists: kubectl exec -it {cluster}-0 -- psql -U app -c '\\dt {table}'",
                f"Check service: kubectl get svc {service_name}",
                f"Test manually: kubectl port-forward svc/{service_name} {local_port}:5432"
            ]
        }), 500
        
    finally:
        if 'port_forward' in locals() and port_forward.poll() is None:
            port_forward.terminate()

@app.route('/restore-cluster', methods=['POST'])
def restore_cluster():
    data = request.get_json()
    clientname=data.get("clientname")
    source_cluster = data.get("source_cluster")
    backup_name = data.get("backup_name")
    new_cluster_name = data.get("new_cluster_name") or f"{source_cluster}-restore-{random.randint(100000, 999999)}"
    s3_endpoint = "http://185.211.155.163:30990/clientbackups"  # or from config
    s3_path = f"{clientname}/{source_cluster}/{source_cluster}/"  # Assuming backup is stored under that

    manifest = {
        "apiVersion": "postgresql.cnpg.io/v1",
        "kind": "Cluster",
        "metadata": {
            "name": new_cluster_name,
            "namespace": "default"
        },
        "spec": {
            "instances": 2,
            "storage": {
                "size": "1Gi",
                "storageClass": "local-path"
            },
            "bootstrap": {
                "recovery": {
                    "backup": {
                        "name": backup_name
                    }
                }
            }
        }
    }
    try:
        config.load_kube_config()
        api = kubernetes.client.CustomObjectsApi()
        api.create_namespaced_custom_object(
            group="postgresql.cnpg.io",
            version="v1",
            plural="clusters",
            namespace="default",
            body=manifest
        )
        return jsonify({"message": f"Restored as {new_cluster_name}"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500




@app.route('/metrics/cluster', methods=['GET'])
def get_cluster_metrics():
    cluster_name = request.args.get('cluster_name')

    try:
        # System metrics
        cpu_query = f'sum(rate(container_cpu_usage_seconds_total{{pod=~"{cluster_name}-.*"}}[5m])) by (pod)'
        memory_query = f'container_memory_working_set_bytes{{pod=~"{cluster_name}-.*"}}'
        
        # PostgreSQL-specific metrics
        postgres_metrics = {
            "connections": prom.custom_query(
                f'pg_stat_activity_count{{cnpg_cluster="{cluster_name}"}}'
            ),
            "replication_lag": prom.custom_query(
                f'pg_replication_lag{{cnpg_cluster="{cluster_name}"}}'
            ),
            "transaction_rate": prom.custom_query(
                f'rate(pg_stat_database_xact_commit_total{{cnpg_cluster="{cluster_name}"}}[5m])'
            ),
            "wal_size": prom.custom_query(
                f'pg_wal_size_bytes{{cnpg_cluster="{cluster_name}"}}'
            )
        }

        return jsonify({
            "system": {
                "cpu": prom.custom_query(cpu_query),
                "memory": prom.custom_query(memory_query)
            },
            "postgres": postgres_metrics
        })

    except Exception as e:
        app.logger.error(f"Metrics error: {str(e)}")
        return jsonify({"error": str(e)}), 500
@app.route('/')
def index():
    return render_template('index4.html')

@app.route('/get-clusters', methods=['GET'])
def get_clusters():
    client_name = request.args.get('client')
    print(f"🔍 Client name: {client_name}")

    try:
        config.load_kube_config()
        api = kubernetes.client.CustomObjectsApi()
        clusters = api.list_cluster_custom_object(
            group="postgresql.cnpg.io",
            version="v1",
            plural="clusters"
        )

        filtered = []
        for cluster in clusters.get("items", []):
            metadata = cluster.get("metadata", {})
            status = cluster.get("status", {})
            
            # Skip if client_name doesn't match
            if client_name and client_name.lower() not in metadata.get("name", "").lower():
                continue

            filtered.append({
                "name": metadata.get("name"),
                "status": status.get("phase", "Unknown"),  # "Cluster in healthy state" → "Healthy"
                "instances": status.get("instances", 0),
                "ready": status.get("readyInstances", 0),
                "primary": status.get("primaryInstance", "N/A"),
                "created": metadata.get("creationTimestamp", "Unknown"),
            })

        return jsonify(filtered)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get-backups', methods=['GET'])
def get_backups():
    client_name = request.args.get('client')
    print(f"🔍 Client name: {client_name}")
    try:
        config.load_kube_config()
        api = kubernetes.client.CustomObjectsApi()
        backups = api.list_cluster_custom_object(
            group="postgresql.cnpg.io",
            version="v1",
            plural="backups"
        )

        filtered = []  # <-- This was outside the try block
        for backup in backups.get("items", []):
            metadata = backup.get("metadata", {})
            spec = backup.get("spec", {})
            status = backup.get("status", {})
            
            # Filtering logic (if needed)
            if client_name and client_name.lower() not in metadata.get("name", "").lower():
                continue

            filtered.append({
                "metadata": {
                    "name": metadata.get("name"),
                    "creationTimestamp": metadata.get("creationTimestamp"),
                    "labels": metadata.get("labels", {}),
                    "annotations": metadata.get("annotations", {})
                },
                "spec": {
                    "cluster": {
                        "name": spec.get("cluster", {}).get("name", "")
                    }
                },
                "status": status
            })

        print(f"✅ Found {len(filtered)} matching backups")
        return jsonify(filtered)  # Directly return the array

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/trigger-backup', methods=['POST'])
def trigger_backup():
    data = request.get_json()
    cluster_name = data.get('clusterName')

    backup_manifest = {
        "apiVersion": "postgresql.cnpg.io/v1",
        "kind": "Backup",
        "metadata": {
            "name": f"manual-backup-{cluster_name}-{int(time.time())}",
            "namespace": "default"
        },
        "spec": {
            "cluster": {
                "name": cluster_name
            },
            "method": "barmanObjectStore"
        }
    }

    try:
        api = kubernetes.client.CustomObjectsApi()
        created_backup = api.create_namespaced_custom_object(
            group="postgresql.cnpg.io",
            version="v1",
            plural="backups",
            namespace="default",
            body=backup_manifest
        )
        return jsonify(created_backup)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/delete-cluster', methods=['DELETE'])
def delete_cluster():
    cluster_name = request.args.get('name')
    try:
        api = kubernetes.client.CustomObjectsApi()
        api.delete_namespaced_custom_object(
            group="postgresql.cnpg.io",
            version="v1",
            plural="clusters",
            namespace="default",
            name=cluster_name
        )
        return jsonify({"message": f"Cluster {cluster_name} deleted"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/create-database', methods=['POST'])
def create_database():
    global cluster_name
    data = request.get_json()
    client_name = data.get('client_name')
    client_company = data.get('client_company')
    db_name = data.get('db_name')
    db_size = data.get('db_size')
    backup_needed = data.get('backup_needed') == 'yes'
    backup_hour = data.get('backup_hour')  # e.g. 03
    backup_day = data.get('backup_day', '*')  # For weekly or monthly
    backup_frequency = data.get('backup_frequency')
    backup_schedule = data.get("backup_schedule", "0 3 * * *")
    s3_endpoint = data.get("s3_endpoint", "http://185.211.155.163:32767")

    cluster_name = f"pg-cluster-{client_name}-{db_name}-{random.randint(1000000000, 9999999999)}"
    s3_bucket = "clientbackups"
    s3_path = f"{client_name}/{cluster_name}/"

    if backup_frequency == "daily":
        backup_schedule = f"0 {backup_hour} * * *"
    elif backup_frequency == "weekly":
        backup_schedule = f"0 {backup_hour} * * {backup_day}"
    elif backup_frequency == "monthly":
        backup_schedule = f"0 {backup_hour} {backup_day} * *"
    else:
        backup_schedule = "0 3 * * *"



    base_template = os.path.abspath(os.path.join(os.getcwd(), '..', 'terraform'))
    cluster_dir = f"{os.path.abspath(os.path.join(os.getcwd(), '..'))}/terraform_states/{cluster_name}"

    try:
        if not os.path.exists(cluster_dir):
            shutil.copytree(base_template, cluster_dir)

        subprocess.run(['terraform', 'init'], cwd=cluster_dir, check=True)

        cmd = [
            'terraform', 'apply',
            '-var', f'cluster_name={cluster_name}',
            '-var', f'instance_count=2',
            '-var', f'storage_size=1Gi',
            '-var', f'storage_class=local-path',
            '-var', f's3_bucket={s3_bucket}',
            '-var', f's3_path={s3_path}',
            '-var', f's3_endpoint={s3_endpoint}',
            '-var', f'backup_enabled={str(backup_needed).lower()}',
            '-var', f'backup_schedule={backup_schedule}',
            '-auto-approve'
        ]

        result = subprocess.run(cmd, cwd=cluster_dir, text=True, capture_output=True)

        print("=== TERRAFORM OUTPUT ===")
        print(result.stdout)
        print("=== TERRAFORM ERRORS ===")
        print(result.stderr)

        if result.returncode != 0:
            return jsonify({
                'error': 'Terraform failed',
                'stdout': result.stdout,
                'stderr': result.stderr
            }), 500
                # Upload the tfstate to MinIO
        tfstate_file = os.path.join(cluster_dir, 'terraform.tfstate')

        s3 = boto3.client(
            's3',
            endpoint_url=s3_endpoint,
            aws_access_key_id="minioadmin",
            aws_secret_access_key="minioadmin",
        )

        s3.upload_file(
            Filename=tfstate_file,
            Bucket=s3_bucket,
            Key=f"{s3_path}terraform.tfstate"
        )
        # Always delete state files (safe)
        for file in ['terraform.tfstate', 'terraform.tfstate.backup']:
            path = os.path.join(cluster_dir, file)
            if os.path.exists(path):
                os.remove(path)
        return jsonify({'message': f'Database {db_name} created successfully in cluster {cluster_name}'})

    except subprocess.CalledProcessError as e:
        return jsonify({'error': f'Terraform error: {e}'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
