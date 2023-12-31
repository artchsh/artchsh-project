import asyncio
import websockets

async def echo(websocket, path):
    print("Websocket server started")
    while True:
        message = await websocket.recv()
        await websocket.send(message)

start_server = websockets.serve(echo, "localhost", 8765)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
