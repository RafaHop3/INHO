import base64
import boto3
import time

sql_script = """
UPDATE users SET role = 'super_admin' WHERE role = 'SUPER_ADMIN';
UPDATE users SET role = 'operator' WHERE role = 'OPERATOR';
UPDATE users SET role = 'client' WHERE role = 'CLIENT';
UPDATE users SET role = 'viewer' WHERE role = 'VIEWER';
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
echo '{b64_sql}' | base64 -d > /tmp/fix_roles.sql
sudo /usr/bin/docker cp /tmp/fix_roles.sql orbe_postgres:/fix_roles.sql
sudo /usr/bin/docker exec orbe_postgres psql -U orbe_admin -d orbesystems -f /fix_roles.sql
'''

out, err = run_cmd(bash_cmd)
with open('fix_out.txt', 'w') as f:
    f.write(out + "\\n\\nERR:\\n" + err)
print("Saved to fix_out.txt")
