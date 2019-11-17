const paper = require('paper/dist/paper-full');

window.onload = function () {
    let canvas = document.getElementById('canvas');
    paper.setup(canvas);
    let path;

    const MOVING = 'moving';
    const BRUSH = 'brush';
    const NEW = 'new';

    const movingButton = document.getElementById(MOVING);
    const brushButton = document.getElementById(BRUSH);
    const newButton = document.getElementById(NEW);


    movingButton.onclick = () => {
        paper.tools = [];
        let tool = new paper.Tool();
        tool.minDistance = 1;
        tool.activate();
        path.selected = true;

        let hitOptions = {
            segments: true,
            stroke: true,
            fill: true,
        };

        paper.view.draw();

        let segment;
        let movePath = false;

        tool.onMouseDown = function(event) {
            segment = path = null;
            let hitResult = paper.project.hitTest(event.point, hitOptions);
            if (!hitResult)
                return;

            if (event.modifiers.shift) {
                if (hitResult.type === 'segment') {
                    hitResult.segment.remove();
                }
                return;
            }

            if (hitResult) {
                path = hitResult.item;
                if (hitResult.type === 'segment') {
                    segment = hitResult.segment;
                } else if (hitResult.type === 'stroke') {
                    let location = hitResult.location;
                    segment = path.insert(location.index + 1, event.point);
                    path.smooth();
                }
            }
            movePath = hitResult.type === 'fill';
            if (movePath)
                paper.project.activeLayer.addChild(hitResult.item);
        };

        tool.onMouseMove = function(event) {
            paper.project.activeLayer.selected = false;
            if (event.item)
                event.item.selected = true;
        };

        tool.onMouseDrag = function(event) {
            if (segment) {
                segment.point.x = segment.point.x + event.delta.x;
                segment.point.y = segment.point.y + event.delta.y;
                path.smooth();
            } else if (path) {
                path.position.x = path.position.x + event.delta.x;
                path.position.y = path.position.y + event.delta.y;
            }
        };
    };

    brushButton.onclick = () => {
        paper.tools = [];
        let largeCircle, location, point_click, distance, arc;

        let tool_contour = new paper.Tool();
        tool_contour.activate();
        tool_contour.minDistance = 5;

        tool_contour.onMouseDown = (event) => {
            location = path.contains(event.point);
            point_click = event.point;
            distance = point_click.getDistance(path.getNearestPoint(point_click)) / 2;
            largeCircle = new paper.Path.Circle({
                center: event.point,
                radius: distance,
                strokeColor: 'black',
                strokeWidth: 2,
                fillColor: '#45dd1b',
                opacity: 0.50
            });
        };

        tool_contour.onMouseDrag = (event) => {
            largeCircle.position = event.point;
            change_contour();
        };

        tool_contour.onMouseUp = () => {
            largeCircle.remove();
        };

        function change_contour() {
            let intersections = largeCircle.getIntersections(path);
            if (intersections.length > 0 && location === true){
                arc = path.unite(largeCircle);
                path.remove();
                path = arc;
            } else if (intersections.length > 0 && location === false){
                arc = path.subtract(largeCircle);
                path.remove();
                path = arc;
            }
        }
    };

    newButton.onclick = () => {
        paper.tools = [];
        let tool = new paper.Tool();
        if (path) {
            path.remove();
        }
        tool.activate();
        tool.minDistance = 40;
        tool.onMouseDown = (event) => {
            if (path) {
                path.selected = false;
            }
            path = new paper.Path();
            path.fullySelected = true;
        };

        tool.onMouseDrag = (event) => {
            path.add(event.point);
        };

        tool.onMouseUp = (event) => {
            path.strokeColor = 'black';
            path.strokeWidth = 5;
            path.closed = true;
            path.selected = false;
            path.smooth();
        };
    };
};