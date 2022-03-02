import click
from pitop import Camera, DriveController
from pitop.labs import RoverWebController


@click.command()
def main():
    drive = DriveController()
    camera = Camera()
    controller = RoverWebController(get_frame=camera.get_frame, drive=drive)
    controller.serve_forever()


if __name__ == "__main__":
    main()  # pragma: no cover
