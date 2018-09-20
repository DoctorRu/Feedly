
**Creating android virtual device**

Troubleshooting:

    sudo apt install qemu-kvm
    sudo adduser $USER kvm
    sudo setfacl -m u:<YOUR USER NAME HERE>:rwx /dev/kvm
<br>

**Building for android**

    ionic cordova platform add android@6.4
<br>

**Running in emulator**

note: To run on real device, just plug it to the usb cable
       (developer mode on phone must to be enabled)

    ionic cordova run android
<br>

**Icons**

https://ionicons.com/