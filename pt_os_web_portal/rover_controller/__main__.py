import click
from pitop.camera import Camera
from pitop.labs import RoverWebController
from pitop.robotics import DriveController


@click.command()
def main():
    drive = DriveController()
    camera = Camera()
    controller = RoverWebController(get_frame=camera.get_frame, drive=drive)
    controller.serve_forever()


if __name__ == "__main__":
    main()  # pragma: no cover
