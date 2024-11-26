import subprocess
import random
import base64
import sys
import glob
import os

PORT = os.environ.get("PORT")

url = f"http://localhost:{PORT}"


def main():

    if len(sys.argv) > 1:
        files = sys.argv[1:]
    else:
        files = glob.iglob("tests/*.hurl")

    email = base64.b64encode(random.randbytes(6)).decode("utf8")
    username = base64.b64encode(random.randbytes(6)).decode("utf8")


    subprocess.run([
                "hurl", 
                "--variable", f"url={url}", 
                "--variable", f"uniq_email={email}@com.com", 
                "--variable", f"uniq_username={username}",
                *files
            ])
    


if __name__ == "__main__":
    main()

