let SVG_PATH_SELECTOR = "#matter-path"
let SVG_WIDTH_IN_PX = 90
let SVG_WIDTH_AS_PERCENT_OF_CONTAINER_WIDTH = .40
let matterContainer = document.querySelector("#matter-container")
let THICCNESS = 70

if (window.innerHeight > window.innerWidth) {
    SVG_WIDTH_IN_PX = 49
}


// module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Body = Matter.Body,
    Svg = Matter.Svg,
    Vector = Matter.Vector,
    Vertices = Matter.Vertices,
    Events = Matter.Events;

// create an engine
var engine = Engine.create();


// create a renderer
var render = Render.create({
    element: matterContainer,
    engine: engine,
    options: {
        width: matterContainer.clientWidth,
        height: matterContainer.clientHeight,
        wireframes: false,
        background: "transparent",
        pixelRatio: 1,
        showAngleIndicator: false

    }
});


// create two boxes and a ground
var boxA = Bodies.rectangle(400, 200, 80, 80);
var boxB = Bodies.rectangle(450, 50, 80, 80);
var ground = Bodies.rectangle(matterContainer.clientWidth / 2, matterContainer.clientHeight + THICCNESS / 2, 2000, THICCNESS, {
    isStatic: true
});

let leftWall = Bodies.rectangle(
    0 - THICCNESS / 2,
    matterContainer.clientHeight / 2,
    THICCNESS,
    matterContainer.clientHeight * 5, {
        isStatic: true
    }
)

let rightWall = Bodies.rectangle(
    matterContainer.clientWidth + THICCNESS / 2,
    matterContainer.clientHeight / 2,
    THICCNESS,
    matterContainer.clientHeight * 10, {
        isStatic: true
    }
)




function shuffle(array) {
    let currentIndex = array.length,
        randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
    }

    return array;
}

// Used like so

let colorArr = ["#F2C126", "#CF013F", "#007BC7", "#00AE5D"]
let windowCenter = matterContainer.clientWidth / 2
let positionXArr = [windowCenter - windowCenter / 2,
                    windowCenter - windowCenter / 3,
                    windowCenter + windowCenter / 3,
                    windowCenter + windowCenter / 2]
let windowHeight = matterContainer.clientHeight
let positionYArr = [windowHeight * 2,
                   windowHeight * 2.5,
                   windowHeight * 3,
                   windowHeight * 3.5]
let angleArr = [0, .5, 1, 1.5, 2, 2, 5, 3, 3.5, 4, 4.5]
let randomXArr = [0, 1, 2, 3]
let randomYArr = [0, 1, 2, 3]
shuffle(randomXArr);
shuffle(randomYArr);
console.log(Math.abs(positionYArr[randomYArr[0]] + 600) * -1)

function createSvgBodies() {

    let counter = 0
    const paths = document.querySelectorAll(SVG_PATH_SELECTOR);
    paths.forEach((path, index) => {
        let vertices = Svg.pathToVertices(path);
        let scaleFactor = (matterContainer.clientWidth * SVG_WIDTH_AS_PERCENT_OF_CONTAINER_WIDTH) / SVG_WIDTH_IN_PX;
        vertices = Vertices.scale(vertices, scaleFactor, scaleFactor);
        let svgBody = Bodies.fromVertices(positionXArr[randomXArr[counter]], Math.abs(positionYArr[randomYArr[counter]]) * -1, [vertices], {
            friction: 0.5,
            frictionAir: 0.00001,
            restitution: .45,
            isStatic: false,
            render: {
                fillStyle: colorArr[counter],
                strokeStyle: colorArr[counter],
                lineWidth: 1
            }
        });
        counter++
        Composite.add(engine.world, svgBody);
        Body.setAngle(svgBody, angleArr[Math.floor(Math.random() * 11)]);
    });
}



createSvgBodies()

// add all of the bodies to the world
Composite.add(engine.world, [ground, leftWall, rightWall]);

let mouse = Matter.Mouse.create(render.canvas)
let mouseConstraint = Matter.MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        stiffness: .1,
        render: {
            visible: false
        }
    }
})

Events.on(mouseConstraint, "startdrag", function () {
    $(".left_box_menu_item").css({
        pointerEvents: "none"
    })
    $(".top_nav_box").css({
        pointerEvents: "none"
    })
})

Events.on(mouseConstraint, "enddrag", function () {
    $(".left_box_menu_item").css({
        pointerEvents: "all"
    })
    $(".top_nav_box").css({
        pointerEvents: "all"
    })
})

Composite.add(engine.world, mouseConstraint)

function scaleBodies() {
    const allBodies = Composite.allBodies(engine.world)

    allBodies.forEach((body) => {
        if (body.isStatic === true) return;
        body.setStatic = true
        const {
            min,
            max
        } = body.bounds
        const bodyWidth = max.x - min.x
        let scaleFactor = (matterContainer.clientWidth * SVG_WIDTH_AS_PERCENT_OF_CONTAINER_WIDTH) / bodyWidth;
        Body.scale(body, scaleFactor, scaleFactor)
    })
}

// run the renderer
Render.run(render);

// create runner
var runner = Runner.create();

// run the engine
Runner.run(runner, engine);

function handleResize(matterContainer) {
    render.canvas.width = matterContainer.clientWidth
    render.canvas.height = matterContainer.clientHeight

    Matter.Body.setPosition(
        ground,
        Matter.Vector.create(matterContainer.clientWidth / 2, matterContainer.clientHeight + THICCNESS / 2))

    Matter.Body.setPosition(
        rightWall,
        Matter.Vector.create(
            matterContainer.clientWidth + THICCNESS / 2,
            matterContainer.clientHeight / 2
        )
    )
    scaleBodies()

}

window.addEventListener("resize", () => handleResize(matterContainer))


//Turn on scroll on canvas
//mouseConstraint.mouse.element.removeEventListener("mousewheel", mouseConstraint.mouse.mousewheel);
//mouseConstraint.mouse.element.removeEventListener("DOMMouseScroll", mouseConstraint.mouse.mousewheel);
