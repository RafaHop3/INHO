import bcrypt

def get_hash(pwd="Orbe123!"):
    return bcrypt.hashpw(pwd.encode("utf-8"), bcrypt.gensalt(12)).decode("utf-8")

print("Admin:", get_hash())
print("Operador:", get_hash())
print("Cliente:", get_hash())
print("Viewer:", get_hash())
