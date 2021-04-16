from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def is_alive():
    return "I'm Alive!"


