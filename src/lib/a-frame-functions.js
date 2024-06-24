// headPosition.yaw = this.el.components['look-controls'].yawObject.rotation.y;
// headPosition.pitch = this.el.components['look-controls'].pitchObject.rotation.x;


export function moveCamera(aorientation) {
    let camera =  document.querySelector('a-entity[camera]')
    camera.components["look-controls"].pitchObject.rotation.x = aorientation.pitch,
    camera.components["look-controls"].yawObject.rotation.y = aorientation.yaw
}

// function to set the fov of the camera
export function setFOV(newFOV) {
    let camera = document.querySelector('a-entity[camera]')
    camera.setAttribute('camera', 'fov', newFOV);
    return newFOV;
}

// function to change the fov of the camera
export function deltaFOV(delta) {
    let camera = document.querySelector('a-entity[camera]')
    let tempfov = camera.getAttribute('camera').fov;
    tempfov += delta;
    if (tempfov < 10) {
        tempfov = 10;
    }
    if (tempfov > 170) {
        tempfov = 170;
    }
    camera.setAttribute('camera', 'fov', tempfov);
    return tempfov;
}

export function returnToMoment(annotation) {
    document.querySelector('#bike_ride').currentTime = annotation.time;
    document.querySelector('#bike_ride').pause();
    moveCamera(annotation.orientation)
    setFOV(annotation.fov)
}