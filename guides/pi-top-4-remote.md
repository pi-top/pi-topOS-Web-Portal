# Featured Guide: Using a pi-top [4] Without A Screen/Keyboard From Another Device


pi-topOS on a pi-top [4] makes it easy to connect remotely. In this guide, we will cover the different ways that you can use your pi-top [4] remotely, things to watch out for as well as how to configure your pi-top [4] using the miniscreen's menu. We will also learn about some important things to be aware of, such as network securiy.

<!--
TO ADD:

* using the display cable
  * may require disconnect/reconnect
  * requires dongle
-->

## ⚠️ Before Continuing!
Please read the following notices before continuing.

### 🙅 Working Online/Offline
Before continuing, it is important to determine if you are intending to work with an internet connection or not. In each chapter, be sure to follow the instructions for your given use case.

#### 🚨 NOTICE: Avoid unnecessary Wi-Fi transmission

Whilst we recommend Direct Wi-Fi connection to the pi-top [4] as a convenient method for working offline, it *does* mean that the Raspberry Pi in the pi-top is **broadcasting as a Wi-Fi network**. In addition, leaving this on while you are also connected to a network is strongly discouraged, as this can lead to security issues.

It is always advisable to attempt to keep Wi-Fi transmissions to a _minimum_, and so:

##### **Direct Wi-Fi Connection should be [disabled](#enabling-disabling-network-options) whenever it is not needed**.

----

##### Jump To Section
1. [Quick Start: Accessing The Desktop Remotely (Recommended for Anyone)](#quick-start-accessing-the-desktop-remotely-recommended-for-anyone)
2. [Quick Start: Remote Programming with Visual Studio Code (Recommended for Programmers)](#quick-start-remote-programming-with-visual-studio-code-recommended-for-programmers)
3. [More Information](#more-information)
4. [References](#references)

----

## Quick Start: Accessing The Desktop Remotely (Recommended for Anyone)

When using a pi-top [4] remotely, the most obvious 'interface' that is missing is a graphical desktop, capable of displaying windowed applications to a display, as opposed to a simple text-only output (known as a console or terminal).

Using the desktop with a display is straightforward as the connection is handled via an HDMI cable. When working remotely, the display needs to be sent over a network connection (this can be wireless or wired).

### Remotely viewing and controlling a desktop
VNC is a graphical desktop sharing system that allows you to remotely control the desktop interface of one computer (running VNC Server) from another computer or mobile device (running VNC Viewer). VNC Viewer transmits the keyboard and either mouse or touch events to VNC Server, and receives updates to the screen in return.

You will see the desktop of the Raspberry Pi inside a window on your computer or mobile device. You’ll be able to control it as though you were working on the Raspberry Pi itself.

VNC Connect from RealVNC is included with Raspberry Pi OS. It consists of both VNC Server, which allows you to control your Raspberry Pi remotely, and VNC Viewer, which allows you to control desktop computers remotely from your Raspberry Pi should you want to.

You must enable VNC Server before you can use it. By default, VNC Server gives you remote access to the graphical desktop that is running on your Raspberry Pi, as though you were sitting in front of it.

However, you can also use VNC Server to gain graphical remote access to your Raspberry Pi if it is headless or not running a graphical desktop. For more information on this, see Creating a virtual desktop, further below.

#### Prerequisite: Install VNC Viewer

First make sure you have RealVNC's VNC Viewer installed. If not, you can install it from the [VNC Viewer downloads page](https://www.realvnc.com/en/connect/download/viewer).

- get instructions for this from any previous 'getting started' info on using VNC
https://www.raspberrypi.org/documentation/computers/remote-access.html#connecting-to-your-raspberry-pi

https://www.realvnc.com/en/connect/download/viewer/

#### Step 1: Enable VNC service on pi-top

* Enable VNC on pi-top

#### Step 2: Connect via VNC Viewer

* On your pi-top [4], navigate to a networking page (using a terminal window or via SSH) use these instructions or run ifconfig to discover your private IP address.

On the device you’ll use to take control, download VNC Viewer. For best results, use the compatible app from RealVNC.

Enter your Raspberry Pi’s private IP address into VNC Viewer:



----

##### Jump To Section
1. [Quick Start: Accessing The Desktop Remotely (Recommended for Anyone)](#quick-start-accessing-the-desktop-remotely-recommended-for-anyone)
2. [Quick Start: Remote Programming with Visual Studio Code (Recommended for Programmers)](#quick-start-remote-programming-with-visual-studio-code-recommended-for-programmers)
3. [More Information](#more-information)
4. [References](#references)

----

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

----

##### Jump To Section
1. [Quick Start: Accessing The Desktop Remotely (Recommended for Anyone)](#quick-start-accessing-the-desktop-remotely-recommended-for-anyone)
2. [Quick Start: Remote Programming with Visual Studio Code (Recommended for Programmers)](#quick-start-remote-programming-with-visual-studio-code-recommended-for-programmers)
3. [More Information](#more-information)
4. [References](#references)

----

## Using The pi-top Display Cable (Secure)
Wired connections offer a secure connection between devices. Whilst Direct Wi-Fi connection offers a convenient solution for connecting to a pi-top [4], it is not always a suitable option.

pi-top Display Cable provides a way to connect to your pi-top [4] directly, without the need for additional Wi-Fi transmission.

----

##### Jump To Section
1. [Quick Start: Accessing The Desktop Remotely (Recommended for Anyone)](#quick-start-accessing-the-desktop-remotely-recommended-for-anyone)
2. [Quick Start: Remote Programming with Visual Studio Code (Recommended for Programmers)](#quick-start-remote-programming-with-visual-studio-code-recommended-for-programmers)
3. [More Information](#more-information)
4. [References](#references)

----

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

----

##### Jump To Section
1. [Quick Start: Accessing The Desktop Remotely (Recommended for Anyone)](#quick-start-accessing-the-desktop-remotely-recommended-for-anyone)
2. [Quick Start: Remote Programming with Visual Studio Code (Recommended for Programmers)](#quick-start-remote-programming-with-visual-studio-code-recommended-for-programmers)
3. [More Information](#more-information)
4. [References](#references)

----

## References

- https://www.raspberrypi.org/blog/coding-on-raspberry-pi-remotely-with-visual-studio-code
- https://www.raspberrypi.org/documentation
