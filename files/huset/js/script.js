const SVG_PATH_SELECTOR = "#matter-path"
const SVG_WIDTH_IN_PX = 90
const SVG_WIDTH_AS_PERCENT_OF_CONTAINER_WIDTH = .85

const matterContainer = document.querySelector("#matter-container")
const THICCNESS = 60

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
let positionYArr = [windowHeight / 2,
                   windowHeight / 3,
                   windowHeight / 4,
                   windowHeight / 5]
let randomXArr = [0, 1, 2, 3]
let randomYArr = [0, 1, 2, 3]
shuffle(randomXArr);
shuffle(randomYArr);

function createSvgBodies() {

    let counter = 0
    const paths = document.querySelectorAll(SVG_PATH_SELECTOR);
    paths.forEach((path, index) => {
        let vertices = Svg.pathToVertices(path);
        let scaleFactor = (matterContainer.clientWidth * SVG_WIDTH_AS_PERCENT_OF_CONTAINER_WIDTH) / SVG_WIDTH_IN_PX;
        vertices = Vertices.scale(vertices, scaleFactor, scaleFactor);
        let svgBody = Bodies.fromVertices(windowCenter, Math.abs(windowHeight / 3 + 600) * -1, [vertices], {
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
    });
}


if (window.innerHeight > window.innerWidth) {
    for (let i = 0; i < 5; i++) {
        setTimeout(function () {
            createSvgBodies()
        }, 500 * i)
    }
} else {
    createSvgBodies()
}

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
    $("#historien_hyperlink").css({
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
    $("#historien_hyperlink ").css({
        pointerEvents: "all"
    })
})

Composite.add(engine.world, mouseConstraint)

function scaleBodies() {
    const allBodies = Composite.allBodies(engine.world)

    allBodies.forEach((body) => {
        if (body.isStatic === true) return;

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

$(".nav_active a").attr({
    href: ""
})

$(".nav_active a").click(function () {
    location.reload()
})

////Turn on scroll on canvas
//mouseConstraint.mouse.element.removeEventListener("mousewheel", mouseConstraint.mouse.mousewheel);
//mouseConstraint.mouse.element.removeEventListener("DOMMouseScroll", mouseConstraint.mouse.mousewheel);