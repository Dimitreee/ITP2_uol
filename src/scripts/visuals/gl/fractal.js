function GlFractal(){
    const shaderSource = shaders.fractal;
    this.name = 'fractal';
    shader(shaderSource);

    const {
        _vertShader: vs,
        _fragShader: fs,
    } = shaderSource

    const gl = drawingContext;

    const program = shaderSource._glProgram;
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    const resolutionLocation = gl.getUniformLocation(program, "iResolution");
    const mouseLocation = gl.getUniformLocation(program, "iMouse");
    const timeLocation = gl.getUniformLocation(program, "iTime");
    const frameRate = gl.getUniformLocation(program, "iFrameRate");
    // const chromaticVibration = gl.getUniformLocation(program, "iChromaticVibration");
    // const shapeSize = gl.getUniformLocation(program, "iShapeSize");

    const positionBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1,
        1, -1,
        -1,  1,
        -1,  1,
        1, -1,
        1,  1,
    ]), gl.STATIC_DRAW);
    gl.useProgram(program);
    gl.enableVertexAttribArray(positionAttributeLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    gl.vertexAttribPointer(
        positionAttributeLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0,
    );

    gl.uniform1f(frameRate, 60);

    this.frequencyBins = ["bass", "lowMid", "highMid", "treble"];

    this.draw = function(){
        push();
        noStroke();
        fill(generateRandomInteger(255), generateRandomInteger(255), generateRandomInteger(255))
        stroke(255);
        rotateY(sound.currentTime() / 10);
        var spectrum = fourier.analyze();

        const bassEnergy = fourier.getEnergy("bass");
        const lowMidEnergy = fourier.getEnergy("lowMid");
        const highMidEnergy = fourier.getEnergy("highMid");
        const trebleEnergy = fourier.getEnergy("treble");

        gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
        gl.uniform2f(mouseLocation, bassEnergy, lowMidEnergy);
        gl.uniform1f(timeLocation, sound.currentTime());

        // sphere(bassEnergy);

        // gl.uniform1f(chromaticVibration, max/1000 * 2);
        // gl.uniform1f(shapeSize, max/1000 * 2);

        gl.drawArrays(
            gl.TRIANGLES,
            0,
            6,
        );

        pop();
    };
}

function generateRandomInteger(max) {
    return Math.floor(Math.random() * max) + 1;
}
