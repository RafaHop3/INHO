import bcrypt
import base64
import boto3
import time
import uuid
from datetime import datetime, timezone

def get_hash(pwd="Orbe123!"):
    return bcrypt.hashpw(pwd.encode("utf-8"), bcrypt.gensalt(12)).decode("utf-8")

h_admin = get_hash()
h_operador = get_hash()
h_cliente = get_hash()
h_viewer = get_hash()

now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

sql_script = f"""
ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20);

INSERT INTO users (id, email, full_name, hashed_password, whatsapp, role, is_active, is_verified, created_at, updated_at) VALUES 
('{str(uuid.uuid4())}', 'admin@orbesystems.com.br', 'Rafael Admin', '{h_admin}', NULL, 'SUPER_ADMIN', true, true, '{now}', '{now}'),
('{str(uuid.uuid4())}', 'pedro@orbesystems.com.br', 'Pedro Operador', '{h_operador}', NULL, 'OPERATOR', true, true, '{now}', '{now}'),
('{str(uuid.uuid4())}', 'juliana@orbesystems.com.br', 'Juliana Rodrigues', '{h_cliente}', '5551984743957', 'CLIENT', true, true, '{now}', '{now}'),
('{str(uuid.uuid4())}', 'thiago@orbesystems.com.br', 'Thiago Viewer', '{h_viewer}', NULL, 'VIEWER', true, true, '{now}', '{now}');
"""

b64_sql = base64.b64encode(sql_script.encode()).decode()

ssm = boto3.client('ssm', region_name='us-east-1')
ec2 = boto3.client('ec2', region_name='us-east-1')
response = ec2.describe_instances(Filters=[{'Name': 'ip-address', 'Values': ['52.20.22.241']}])
instance_id = response['Reservations'][0]['Instances'][0]['InstanceId']

def run_cmd(cmd_str):
    resp = ssm.send_command(
        InstanceIds=[instance_id],
        DocumentName='AWS-RunShellScript',
        Parameters={'commands': [cmd_str]},
    )
    cid = resp['Command']['CommandId']
    while True:
        time.sleep(2)
        result = ssm.get_command_invocation(CommandId=cid, InstanceId=instance_id)
        if result['Status'] not in ('Pending', 'InProgress'):
            return result['StandardOutputContent'], result['StandardErrorContent']

bash_cmd = f'''
echo '{b64_sql}' | base64 -d > /tmp/seed.sql
sudo /usr/bin/docker cp /tmp/seed.sql orbe_postgres:/seed.sql
sudo /usr/bin/docker exec orbe_postgres psql -U orbe_admin -d orbesystems -f /seed.sql
'''

out, err = run_cmd(bash_cmd)
with open('ssm_sql_out.txt', 'w') as f:
    f.write(out + "\\n\\nERR:\\n" + err)
print("Saved to ssm_sql_out.txt")
