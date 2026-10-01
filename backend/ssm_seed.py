import boto3
import time
import base64

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

python_script = """
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import asyncio
from sqlalchemy import text
from db.session import async_session_maker
from models.models import User, UserRole
from core.security import hash_password

async def seed():
    async with async_session_maker() as session:
        print("Wiping DB...")
        await session.execute(text("TRUNCATE users CASCADE;"))
        
        print("Seeding Users...")
        admin = User(email="admin@orbesystems.com.br", full_name="Rafael Admin", role=UserRole.SUPER_ADMIN, hashed_password=hash_password("Orbe123!"), is_verified=True)
        operador = User(email="pedro@orbesystems.com.br", full_name="Pedro Operador", role=UserRole.OPERATOR, hashed_password=hash_password("Orbe123!"), is_verified=True)
        cliente = User(email="juliana@orbesystems.com.br", full_name="Juliana Rodrigues", role=UserRole.CLIENT, whatsapp="5551984743957", hashed_password=hash_password("Orbe123!"), is_verified=True)
        cliente2 = User(email="thiago@orbesystems.com.br", full_name="Thiago Viewer", role=UserRole.VIEWER, hashed_password=hash_password("Orbe123!"), is_verified=True)
        
        session.add_all([admin, operador, cliente, cliente2])
        await session.commit()
        print("Success! DB Seeded.")

if __name__ == '__main__':
    asyncio.run(seed())
"""
b64 = base64.b64encode(python_script.encode()).decode()
bash_cmd = f'''
echo '{b64}' | base64 -d > /tmp/seed_ec2.py
sudo /usr/bin/docker cp /tmp/seed_ec2.py orbe_backend:/app/seed_ec2.py
sudo /usr/bin/docker exec orbe_backend bash -c "cd /app && python seed_ec2.py"
'''

out, err = run_cmd(bash_cmd)
with open('ssm_seed_out.txt', 'w') as f:
    f.write(out + "\n\nERR:\n" + err)
print("Saved to ssm_seed_out.txt")
