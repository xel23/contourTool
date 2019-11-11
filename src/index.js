const paper = require('paper/dist/paper-full');

window.onload = function () {

    let tool = new paper.Tool();

    let canvas = document.getElementById('canvas');
    paper.setup(canvas);
    let path;

    let contourInner = 'Contour';
    let movingInner = 'Moving';

    let switcher = document.getElementById('switcher');
    switcher.addEventListener('click', () => {
        switcher.innerText = switcher.innerText === contourInner ? movingInner : contourInner;
        changeBehavior(switcher.innerText);
    });


    function changeBehavior(mode) {
        switch (mode) {
            case contourInner: {
                console.log('contour');

                tool.minDistance = 40;
                tool.onMouseDown = (event) => {
                    if (path) {
                        path.selected = false;
                    }
                    path = new paper.Path();
                    path.strokeColor = 'black';
                    path.strokeWidth = 5;
                    path.fullySelected = true;
                };

                tool.onMouseDrag = (event) => {
                    path.add(event.point);
                };

                tool.onMouseUp = (event) => {
                    path.closed = true;
                    path.selected = false;
                    path.smooth();
                };
                break;
            }

            case movingInner: {

                console.log('moving');
                // let values = {
                //     paths: 1,
                //     minPoints: 5,
                //     maxPoints: 15,
                //     minRadius: 150,
                //     maxRadius: 300
                // };
                //

                tool.minDistance = 1;
                path.smooth();

                let hitOptions = {
                    segments: true,
                    stroke: true,
                    fill: true,
                    tolerance: 5
                };
                //
                // createPaths();

                paper.view.draw();

                // function createPaths() {
                //     let center = {
                //         width: 0,
                //         height: 0
                //     };
                //     let radiusDelta = values.maxRadius - values.minRadius;
                //     let pointsDelta = values.maxPoints - values.minPoints;
                //     for (let i = 0; i < values.paths; i++) {
                //         let radius = values.minRadius + Math.random() * radiusDelta;
                //         let points = values.minPoints + Math.floor(Math.random() * pointsDelta);
                //         let p = paper.Point.random();
                //         center.width = paper.view.size.width * p.x;
                //         center.height = paper.view.size.height * p.y;
                //         let path = createBlob(center, radius, points);
                //         let lightness = (Math.random() - 0.5) * 0.4 + 0.4;
                //         let hue = Math.random() * 360;
                //         path.fillColor = { hue: hue, saturation: 1, lightness: lightness };
                //         path.strokeColor = 'black';
                //     }
                // }

                // function createBlob(center, maxRadius, points) {
                //     let point_to_add = {
                //         width: 0,
                //         height: 0
                //     };
                //     let path = new paper.Path();
                //     path.closed = true;
                //     for (let i = 0; i < points; i++) {
                //         let delta = new paper.Point({
                //             length: (maxRadius * 0.5) + (Math.random() * maxRadius * 0.5),
                //             angle: (360 / points) * i
                //         });
                //         point_to_add.width = center.width + delta.x;
                //         point_to_add.height = center.height + delta.y;
                //         path.add(point_to_add);
                //     }
                //     path.smooth();
                //     return path;
                // }

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
                break;
            }

            default: {
                console.log('Oops');
            }
        }
    }

    changeBehavior(switcher.innerText);
};