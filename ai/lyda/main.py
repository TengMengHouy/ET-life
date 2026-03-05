import eureka_client
from fastapi import FastAPI

app = FastAPI()

EUREKA_SERVER = "http://localhost:8761/eureka/"
APP_NAME = "fastapi-service"
APP_PORT = 8000

# Register the FastAPI app with Eureka
eureka_client.init(
    eureka_server=EUREKA_SERVER,
    app_name=APP_NAME,
    instance_port=APP_PORT,
)


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello {name}"}
