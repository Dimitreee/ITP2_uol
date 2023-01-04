function GlPulse(){
    const shaderSource = shaders.pulse;
    this.name = 'pulse';
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
    const initialLuna = gl.getUniformLocation(program, "iInitialLuna");
    const chromaticAbberation = gl.getUniformLocation(program, "iChromationAbberation");
    const shapeSize = gl.getUniformLocation(program, "iShapeSize");

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

    this.draw = function(){
        push();
        noStroke();
        fill(generateRandomInteger(255), generateRandomInteger(255), generateRandomInteger(255))
        stroke(255);
        rotateY(sound.currentTime() / 10);

        const {
            highMidEnergy,
            bassEnergy,
            lowMidEnergy,
            trebleEnergy,
        } = getSpecterEnergy();

        gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
        gl.uniform1f(timeLocation, sound.currentTime());
        gl.uniform1f(initialLuna, 0.5);

        gl.uniform1f(shapeSize, bassEnergy/1000 * 3);
        gl.uniform1f(chromaticAbberation, lowMidEnergy/1000);

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
