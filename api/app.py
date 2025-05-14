import boto3
from flask import Flask, render_template, request, jsonify
import os
import shutil
import random
from flask_cors import CORS
import kubernetes.client
from kubernetes import config
import subprocess
from flask import request

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])
cluster_name = ""


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
