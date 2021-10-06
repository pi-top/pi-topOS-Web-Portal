# Featured Guide: Using a pi-top [4] Without A Screen/Keyboard From Another Device

pi-topOS on a pi-top [4] makes it easy to connect remotely. In this guide, we will cover the different ways that you can use your pi-top [4] remotely, and how to configure your pi-top [4] using the miniscreen's menu.

## Working Online/Offline
It is important to determine if you are intending to work with an internet connection or not. In each chapter, be sure to follow the instructions for your given use case.

The recommended method for working offline is via a Direct Wi-Fi connection to the pi-top [4]. However, leaving this on when you are also connected to a network is strongly discouraged, as this can lead to security issues. Disabling this is simple - check out the [ENABLING/DISABLING INTERFACES] section.

<!-- Table of contents? -->

## Quick Start: Accessing The Desktop Remotely (Recommended for Anyone)

- get instructions for this from any previous 'getting started' info on using VNC
https://www.raspberrypi.org/documentation/computers/remote-access.html#connecting-to-your-raspberry-pi

* Enable VNC
* Download and Install VNC Viewer
* Connect

## Quick Start: Remote Programming with Visual Studio Code (Recommended for Programmers)

[Visual Studio Code](https://code.visualstudio.com), or VS Code, is a free, open source, developer’s text editor with a whole swathe of extensions to support you coding in multiple languages, and provide tools to support your development.

One of the extensions that helps here is the Remote SSH extension, part of a pack of remote development extensions. This extension allows you to connect to a remote device over SSH, and run VS Code as if you were running on that remote device. You see the remote file system, the VS Code terminal runs on the remote device, and you access the remote device’s hardware. When you are debugging, the debug session runs on the remote device, but VS Code runs on the host machine.

This is the recommended method for pi-top [4] users looking to do some general purpose programming
with some experience using an IDE.

### Connecting via Router (e.g. Home Network)

The following instructions are for users who wish to run code directly on a pi-top [4] from another laptop/computer on the same network as the pi-top (usually with internet access).

#### Prerequisite: Install VS Code
First make sure you have VS Code installed. If not, you can install it from the [VS Code downloads page](https://code.visualstudio.com/Download).

#### Step 1: Enable SSH service on pi-top

* Enable SSH on pi-top
- https://www.raspberrypi.org/blog/coding-on-raspberry-pi-remotely-with-visual-studio-code/

#### Step 2: Set up VS Code

From inside VS Code, you will need to install the Remote SSH extension. Select the Extensions tab from the sidebar menu, then search for Remote development. Select the **Remote Development extension**, and select the **Install** button.

![](https://lh4.googleusercontent.com/HC5GcEZwIz546-qGwhiUdd9okgik7A3wq314GrqbJbymY-nZF1gH63oRSW7Mi9JSNsnHyrJSojrxJZG0sq9lEo30sPK_chJw6RU6Y5F1SodfjbnydkQkENlhmNMkBqjgQyqDBFJR)

Next you can connect to your Raspberry Pi. Launch the VS Code command palette using *Ctrl+Shift+P* on Linux or Windows, or *Cmd+Shift+P* on macOS. Search for and select **Remote SSH: Connect current window to host** (there’s also a **connect to host** option that will create a new window).

![](https://lh5.googleusercontent.com/79wMPfotWp9n26-fqP0CWn_ceL_6t_cBT7cQEU0q5P-f8pAubuESZUcsGVqRq20vmmhRnFIuX4VM-0eRB1-L9qW_vnxcfOHgLgRxNEYUqpLQm_uVGdfbdSB9CYVE3-6hb-WnaExu)

Enter the SSH connection details, using *user@host*. For the *user*, enter the Raspberry Pi username (the default is *pi*). For the *host*, enter the IP address of the Raspberry Pi, or the hostname. The hostname needs to end with *.local*, so if you are using the default hostname of `pi-top`, enter `pi-top.local`.

*The .local syntax is supported on macOS and the latest versions of Windows or Linux. If it doesn’t work for you then you can install additional software locally to add support. On Linux, install Avahi using the command `sudo apt-get install avahi-daemon`. On Windows, install either Bonjour Print Services for Windows, or iTunes for Windows.*

For example, to connect to a pi-top [4] with a hostname of `pi-top` using the default `pi` user, enter `pi@pi-top.local`:

![](https://lh4.googleusercontent.com/97BO9x4cwjQPk2cdXvADzKzq1ABhJGOZOTmUs4ROG-OED4i4tvd5VYZpfFd3tBzrcpaOhhMPOVBDoNKxtjq8__JFEAqxT7XqwAJd9sQtmt6fhl9jgVzIPpE5str-8JyBLVwU-JD0)

The first time you connect, it will validate the fingerprint to ensure you are connecting to the correct host. Select **Continue** from this dialog.

![](https://lh5.googleusercontent.com/NnCfA7ngHjQ_ElLa-H9dKHwp_5FR7UpRE6G6L0yg8EfXqBpk-yJdz37uCeGqnrdJNxbCqJ3_UK0gPICZrIucfYSp3n5bHtLO0DSv6fvjQp3w5obfJblTM81isFia_3LrRJgAlS-Z)

Enter your Raspberry Pi’s password when promoted. The default is `pi-top`, but you should have changed this (really, you should!).

![](https://lh4.googleusercontent.com/yEtmUO3UNc5ZfchEXkUfH8XyP3Lo0U-UUjPcjSRSeE0Px0d0RlvJ6TRPKoeT-HvudJW1FurncaZ411OgpoFjyWAPDf4mYfflGcqdKBMn6PM0VyvBdsZGR-r1uXRKoKaEHFDAsxfL)

#### Step 4: Code

You will now be all set up and ready to code! Start by opening a folder or cloning a git repository and away you go coding, debugging and deploying your applications.

In the remote session, not all extensions you have installed locally will be available remotely. Any extensions that change the behavior of VS Code as an application, such as themes or tools for managing cloud resources, will be available.

Things like language packs and other programming tools are not installed in the remote session, so you’ll need to re-install them. When you install these extensions, you’ll see the **Install** button has changed to **Install in SSH:< hostname >** to show it’s being installed remotely.

## More Information

This section covers details for users interested in understanding all of the different ways that they can use their pi-top [4] from another device.


### Interface Types: An Overview
There are 4 different types of interface - 2 are , and 2 are wireless.

#### Ethernet (Router)
This is pretty straightforward - an Ethernet cable connects a pi-top to a network via a router, which manages its connection, typically with access to the internet.


#### Wi-Fi (Router)
This is pretty straightforward - an Ethernet cable connects a pi-top to a network via a router, which manages its connection, typically with access to the internet.

#### Using multiple interfaces at once
Whilst this is possible, it is generally not recommended due to the extra complexity.


### Enabling/Disabling Direct Wi-Fi Connection
*

### Connection Types: An Overview
#### SSH


#### VNC
