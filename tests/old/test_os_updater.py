import asyncio

import pytest
import websockets

uri = "ws://localhost:80/os-upgrade"


async def send_command(command, wait_for=None, messages=[], timeout=5):
    async with websockets.connect(uri) as websocket:
        await websocket.send(command)
        while True:
            message = eval(await asyncio.wait_for(websocket.recv(), timeout=timeout))
            if not (message.get("payload") and message.get("type")):
                print("Received a message with invalid format")
                break
            messages.append(message)
            if message["payload"].get("status") == wait_for:
                break


@pytest.mark.skip(reason="failing test..")
def test_prepare_upgrade_success(socket_app):
    messages = list()
    asyncio.get_event_loop().run_until_complete(
        send_command(command="prepare", wait_for="FINISH", messages=messages)
    )
    assert len(messages) > 2
    assert messages[0]["type"] == "OS_PREPARE_UPGRADE"
    assert messages[0]["payload"]["status"] == "START"
    assert messages[-1]["payload"]["status"] == "FINISH"


@pytest.mark.skip(reason="failing test..")
def test_start_uprade_success(socket_app):
    messages = list()
    asyncio.get_event_loop().run_until_complete(
        send_command(command="start", wait_for="FINISH", messages=messages)
    )
    assert len(messages) > 2
    assert messages[0]["type"] == "OS_UPGRADE"
    assert messages[0]["payload"]["status"] == "START"
    assert messages[-1]["payload"]["status"] == "FINISH"


@pytest.mark.skip(reason="failing test..")
def test_upgrade_size_success(socket_app):
    messages = list()
    asyncio.get_event_loop().run_until_complete(
        send_command(command="size", wait_for="STATUS", messages=messages)
    )
    assert len(messages) == 1
    assert messages[0]["type"] == "SIZE"
    assert messages[0]["payload"]["size"]["downloadSize"] == 2155000000
    assert messages[0]["payload"]["size"]["requiredSpace"] == 99300000


def test_unknown_command(socket_app):
    messages = list()
    with pytest.raises(Exception):
        asyncio.get_event_loop().run_until_complete(
            send_command(
                command="not-a-command", wait_for=None, messages=messages, timeout=0.5
            )
        )
    assert len(messages) == 0
