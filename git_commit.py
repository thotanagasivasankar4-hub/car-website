import os
from dulwich import porcelain

repo_path = r"c:\Users\devas\OneDrive\Desktop\New folder"

# Initialize repo if not already initialized
git_dir = os.path.join(repo_path, ".git")
if not os.path.exists(git_dir):
    repo = porcelain.init(repo_path)
    print("Initialized git repo at", repo_path)
else:
    repo = porcelain.open_repo(repo_path)
    print("Opened existing git repo")

# Add files respecting .gitignore
porcelain.add(repo_path)
print("Added files to staging area")

# Commit
try:
    commit_id = porcelain.commit(
        repo_path,
        message=b"Initial commit: NOCTIS minimal electric car scrollytelling website",
        author=b"Thota Naga Sivasankar <thotanagasivasankar4@gmail.com>",
        committer=b"Thota Naga Sivasankar <thotanagasivasankar4@gmail.com>"
    )
    print("Committed successfully! Commit ID:", commit_id.decode('ascii'))
except Exception as e:
    print("Commit result:", e)
