import boto3
import time

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

bash_cmd = r'''
sudo /usr/bin/docker exec orbe_backend bash -c "ls -la /app && echo '--- DB ---' && ls -la /app/db 2>/dev/null || echo 'No db dir'"
'''

out, err = run_cmd(bash_cmd)
with open('ssm_debug.txt', 'w') as f:
    f.write(out + "\n\nERR:\n" + err)
print("Saved to ssm_debug.txt")
