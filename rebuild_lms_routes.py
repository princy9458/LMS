import os
import shutil
import uuid

base = r'd:\Projects\lms-one'
# Normalize the base path
base = os.path.abspath(base)

# Relative paths to parents that have conflicts
parents = [
    r'app\api\lms\courses',
    r'app\api\lms\enrollment',
    r'app\lms\learn'
]

# Items we WANT to keep from those parents
keep_map = {
    r'app\api\lms\courses': ['[id]', 'route.js'],
    r'app\api\lms\enrollment': ['[id]'],
    r'app\lms\learn': ['[id]']
}

backup_root = os.path.join(base, '_REBUILD_BACKUP_' + str(uuid.uuid4())[:8])
os.makedirs(backup_root, exist_ok=True)
print(f"Backup root: {backup_root}")

for parent_rel in parents:
    parent_abs = os.path.join(base, parent_rel)
    if not os.path.exists(parent_abs):
        print(f"Skipping non-existent parent: {parent_abs}")
        continue
    
    print(f"Processing parent: {parent_abs}")
    
    # 1. Move the entire parent to backup
    parent_name = parent_rel.replace('\\', '_')
    bkp_path = os.path.join(backup_root, parent_name)
    
    try:
        print(f"Moving {parent_abs} to {bkp_path}")
        shutil.move(parent_abs, bkp_path)
    except Exception as e:
        print(f"Direct move failed: {e}. Trying copy + delete fallback.")
        try:
            shutil.copytree(parent_abs, bkp_path)
            shutil.rmtree(parent_abs)
        except Exception as e2:
            print(f"Completely failed to move {parent_abs}: {e2}")
            continue

    # 2. Recreate the parent
    os.makedirs(parent_abs, exist_ok=True)
    
    # 3. Move back the "good" items
    to_keep = keep_map.get(parent_rel, [])
    for item in to_keep:
        src = os.path.join(bkp_path, item)
        dest = os.path.join(parent_abs, item)
        if os.path.exists(src):
            print(f"Restoring {item} to {dest}")
            try:
                shutil.move(src, dest)
            except Exception as e:
                print(f"Failed to restore {item}: {e}")
        else:
            print(f"Item not found in backup: {src}")

print("Rebuild operation complete. Please check the 'app' directory tree.")
