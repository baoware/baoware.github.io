async function getRatings() {
    try {
        const response = await fetch('ratings.json');
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        const data = await response.json();
        return data; 
    } catch (error) {
        console.error(error);
    }
}

//
async function generateMovies(data){
    const dataString = JSON.stringify(data);
    const nodes = JSON.parse(dataString);

    var svg = d3.select('#svg svg')
        .attr('width', 1600)
        .attr('height', 900)
        .attr('viewBox', '0 0 1600 900');

    const simulation = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength(-39))
        .force("x", d3.forceX(785))
        .force("y", d3.forceY(450));

    // Add images as nodes.
    const node = svg.append("g")
        .selectAll("image")
        .data(nodes)
        .join("image")
        .attr("href", d => d.poster) // Set the image URL
        .attr("width", 25) // Set image width
        .attr("height", 25) // Set image height

    node.append("title")
        .text(d => d.Name);

    // Add a drag behavior.
    node.call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Set the position attributes of nodes each time the simulation ticks.
    simulation.on("tick", () => {
        node
            .attr("x", d => d.x) // Adjust for image centering
            .attr("y", d => d.y); // Adjust for image centering
    });

    // Drag event handlers
    function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }

    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }

    function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }
    


    // Generate the tooltip
    function generateTooltip(container) {{
        const title = container.append('text')
        .attr('x', 0)
        .attr('y', 0)
        .attr('fill', 'white')
        .attr('font-family', 'Helvetica Neue, Arial')
        .attr('font-size', '32px')
        .attr('class', 'Description')
    }};

    const tooltip = svg.append('g')
        .attr('transform', 'translate(10, 35)')
        .call(generateTooltip);

    const movies = d3.selectAll('image')

    movies
    .on('mouseover', function (event, d) {
        if (simulation.alpha() < 0.0012){
            const image = d3.select(this);
            const text = d.Name;
            const star = d3.symbol().type(d3.symbolStar).size(300);

            tooltip.selectAll("path")
                .remove();

            tooltip.select('.Description').text(text);

            for (let i = 0; i<d.Rating; i++){
                tooltip.append("path")
                    .attr("d", star)
                    .attr("transform", `translate(${i * 36+20}, 30)`)
                    .attr("fill", "gold")
                    .transition()
                    .duration(200) 
                    .attr("opacity", 1);
            }

            if (d.Rating%1==0.5){
                tooltip.append("rect")
                    .attr("x", (d.Rating-0.5) * 36 + 20) // Position next to the last full star
                    .attr("y", 15)
                    .attr("width", 15) // Half the width of a full star
                    .attr("height", 30) // Same height as a full star
                    .attr("fill", "#121212");
            }

            // Calculate the new width and height
            const newWidth = 50;
            const newHeight = 50;

            // Get the current bounding box of the image
            const bbox = image.node().getBBox();
            const centerX = bbox.x + bbox.width / 2;
            const centerY = bbox.y + bbox.height / 2;

            // Adjust x and y to keep the image centered
            const newX = centerX - newWidth / 2;
            const newY = centerY - newHeight / 2;

            // Apply new attributes
            image
            .transition()
            .duration(150)
            .attr('width', newWidth)
            .attr('height', newHeight)
            .attr('x', newX)
            .attr('y', newY);
        }
    })

    .on('mouseout', function () {
        const image = d3.select(this);

        // Calculate the new width and height
        const newWidth = 25;
        const newHeight = 25;

        // Get the current bounding box of the image
        const bbox = image.node().getBBox();
        const centerX = bbox.x + bbox.width / 2;
        const centerY = bbox.y + bbox.height / 2;

        // Adjust x and y to keep the image centered
        const newX = centerX - newWidth / 2;
        const newY = centerY - newHeight / 2;

        // Apply new attributes
        image
        .transition()
        .duration(300)
        .attr('width', newWidth)
        .attr('height', newHeight)
        .attr('x', newX)
        .attr('y', newY);
    })
    .on('click', function (event, d){
        if (d['Letterboxd URI']) {
            window.open(d['Letterboxd URI'], '_blank');
        }
    })
}

async function separateByRating(data){
    const dataString = JSON.stringify(data);
    const array = JSON.parse(dataString);

    for(let i = 0.5; i<5.5; i+=0.5){
        let data = array.filter(d => (d.Rating==i));
        generateRatingSim(i,data);
    }

    async function generateRatingSim(rating, data){
        const nodes = data;

        var svg = d3.select('#svg svg')
        .attr('width', 1600)
        .attr('height', 900)
        .attr('viewBox', '0 0 1600 900');

        let strength = 0.1;
        if (nodes.length>10){
            if (nodes.length<50){
                strength = 0.2;
            } else {
                strength = 0.3;
            }
        }   

        const forceCenter = getForceCenter(rating);

        const simulation = d3.forceSimulation(nodes)
            .force("charge", d3.forceManyBody().strength(-35))
            .force("x", d3.forceX(forceCenter).strength(strength))
            .force("y", d3.forceY(425));

        const star = d3.symbol().type(d3.symbolStar).size(100);

        for (let i = 0; i<rating; i++){
            svg.append("path")
                .attr("d", star)
                .attr("transform", `translate(${i * 20 + forceCenter - rating*4}, 180)`)
                .attr("fill", "gold")
                .transition()
                .duration(200) 
                .attr("opacity", 1);
        }

        if (rating%1==0.5){
            svg.append("rect")
                .attr("x", (rating-0.5) * 20 + forceCenter - rating*4) // Position next to the last full star
                .attr("y", 165)
                .attr("width", 15) // Half the width of a full star
                .attr("height", 30) // Same height as a full star
                .attr("fill", "#121212");
        }
        
        // Add images as nodes.
        const node = svg.append("g")
            .selectAll("image")
            .data(nodes)
            .join("image")
            .attr("href", d => d.poster) // Set the image URL
            .attr("width", 25) // Set image width
            .attr("height", 25) // Set image height

        node.append("title")
            .text(d => d.Name);

        // Add a drag behavior.
        node.call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

        // Set the position attributes of nodes each time the simulation ticks.
        simulation.on("tick", () => {
            node
                .attr("x", d => d.x) // Adjust for image centering
                .attr("y", d => d.y); // Adjust for image centering
        });

        // Drag event handlers
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        // Generate the tooltip
        function generateTooltip(container) {{
            const title = container.append('text')
            .attr('x', 0)
            .attr('y', 0)
            .attr('fill', 'white')
            .attr('font-family', 'Helvetica Neue, Arial')
            .attr('font-size', '32px')
            .attr('class', 'Description')
        }};

        const tooltip = svg.append('g')
            .attr('transform', 'translate(10, 35)')
            .call(generateTooltip);

        const movies = d3.selectAll('image')


        movies
        .on('mouseover', function (event, d) {
            if (simulation.alpha() < 0.0012){
                const image = d3.select(this);
                const text = d.Name;
                const star = d3.symbol().type(d3.symbolStar).size(300);

                tooltip.selectAll("path")
                    .remove();

                tooltip.select('.Description').text(text);

                for (let i = 0; i<d.Rating; i++){
                    tooltip.append("path")
                        .attr("d", star)
                        .attr("transform", `translate(${i * 36+20}, 30)`)
                        .attr("fill", "gold")
                        .transition()
                        .duration(200) 
                        .attr("opacity", 1);
                }

                if (d.Rating%1==0.5){
                    tooltip.append("rect")
                        .attr("x", (d.Rating-0.5) * 36 + 20) // Position next to the last full star
                        .attr("y", 15)
                        .attr("width", 15) // Half the width of a full star
                        .attr("height", 30) // Same height as a full star
                        .attr("fill", "#121212");
                }

                // Calculate the new width and height
                const newWidth = 50;
                const newHeight = 50;

                // Get the current bounding box of the image
                const bbox = image.node().getBBox();
                const centerX = bbox.x + bbox.width / 2;
                const centerY = bbox.y + bbox.height / 2;

                // Adjust x and y to keep the image centered
                const newX = centerX - newWidth / 2;
                const newY = centerY - newHeight / 2;

                // Apply new attributes
                image
                .transition()
                .duration(150)
                .attr('width', newWidth)
                .attr('height', newHeight)
                .attr('x', newX)
                .attr('y', newY);
            }
        })

        .on('mouseout', function () {
            const image = d3.select(this);

            // Calculate the new width and height
            const newWidth = 25;
            const newHeight = 25;

            // Get the current bounding box of the image
            const bbox = image.node().getBBox();
            const centerX = bbox.x + bbox.width / 2;
            const centerY = bbox.y + bbox.height / 2;

            // Adjust x and y to keep the image centered
            const newX = centerX - newWidth / 2;
            const newY = centerY - newHeight / 2;

            // Apply new attributes
            image
            .transition()
            .duration(300)
            .attr('width', newWidth)
            .attr('height', newHeight)
            .attr('x', newX)
            .attr('y', newY);
        })
        .on('click', function (event, d){
            if (d['Letterboxd URI']) {
                window.open(d['Letterboxd URI'], '_blank');
            }
        })
    }

    // center mapping
    function getForceCenter(rating) {
        switch (rating) {
            case 0.5:
                return 60;
            case 1.0:
                return 200;
            case 1.5:
                return 340;
            case 2.0:
                return 500;
            case 2.5:
                return 660;
            case 3.0:
                return 830;
            case 3.5:
                return 1000;
            case 4.0:
                return 1160;
            case 4.5:
                return 1320;
            case 5.0:
                return 1480;
            default:
                return 0;
        }
    }


}


function generateGenreSim(i, genre, dataForGenre, svg, tooltipGroup, tooltipTitle, starsGroup) {
    const nodes = JSON.parse(JSON.stringify(dataForGenre));

    if (nodes.length === 0) return;

    function getGenreForceCenterX(idx) {
        const itemsPerRow = 5;
        const col = idx % itemsPerRow;
        return col * 320 + 160;
    }

    function getGenreForceCenterY(idx) {
        const itemsPerRow = 5;
        const row = Math.floor(idx / itemsPerRow);
        return (row * 450 + 350); 
    }

    const forceCenterX = getGenreForceCenterX(i);
    const forceCenterY = getGenreForceCenterY(i);


    svg.append("text")
        .attr("x", forceCenterX)
        .attr("y", forceCenterY - 200) 
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-family", "Helvetica Neue, Arial")
        .attr("font-size", "18px")
        .text(genre);

    let strength = -35
    if (nodes.length>10){
        if (nodes.length<30){
            strength = -28;
        } else {
            strength = -20;
        }
    } 

    const simulation = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength(strength))
        .force("x", d3.forceX(forceCenterX))
        .force("y", d3.forceY(forceCenterY)); 

    const genreSpecificGroup = svg.append("g")
        .attr("class", `genre-simulation-group-${genre.toLowerCase().replace(/\s+/g, '-')}`);

  
    const node = genreSpecificGroup.selectAll("image") 
        .data(nodes, d => d.Name) 
        .join("image") 
        .attr("class", `movie-node ${genre.toLowerCase().replace(/\s+/g, '-')}-node`)
        .attr("href", d => d.poster)
        .attr("width", 25)
        .attr("height", 25)
        .attr("xlink:href", d => d.poster); 

    node.append("title") 
        .text(d => d.Name);

    node.call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    simulation.on("tick", () => {
        node
            .attr("x", d => d.x - 12.5) // Adjust for image centering
            .attr("y", d => d.y - 12.5); // Adjust for image centering
    });

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x; 
        d.fy = d.y; 
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
    }

    
    node 
        .on('mouseover', function (event, d) { 
            if (simulation.alpha() < 0.0012) { 
                tooltipGroup.style('opacity', 1);
                const imageElement = d3.select(this); 

                tooltipTitle.text(d.Name);
                starsGroup.selectAll("*").remove();

                const star = d3.symbol().type(d3.symbolStar).size(300);

                for (let i = 0; i<d.Rating; i++){
                    starsGroup.append("path")
                        .attr("d", star)
                        .attr("transform", `translate(${i * 36+20}, 30)`)
                        .attr("fill", "gold")
                        .transition()
                        .duration(200) 
                        .attr("opacity", 1);
                }

                if (d.Rating % 1 == 0.5) {
                    starsGroup.append("rect")
                        .attr("x", (d.Rating-0.5) * 36 + 20) // Position next to the last full star
                        .attr("y", 15)
                        .attr("width", 15) // Half the width of a full star
                        .attr("height", 30) // Same height as a full star
                        .attr("fill", "#121212");
                }

                const newWidth = 50;
                const newHeight = 50;
                imageElement.raise(); 
                imageElement.transition().duration(150)
                    .attr('width', newWidth)
                    .attr('height', newHeight)
                    .attr('x', d.x - newWidth / 2) 
                    .attr('y', d.y - newHeight / 2);
            }
        })
        .on('mouseout', function (event, d) { 
            tooltipGroup.style('opacity', 0);
            const imageElement = d3.select(this);

            const originalWidth = 25;
            const originalHeight = 25;

            imageElement.transition().duration(300)
                .attr('width', originalWidth)
                .attr('height', originalHeight)
                .attr('x', d.x - originalWidth / 2)
                .attr('y', d.y - originalHeight / 2);
        })
        .on('click', function (event, d) {
            if (d['Letterboxd URI']) {
                window.open(d['Letterboxd URI'], '_blank');
            }
        });
}

function separateByGenre(data) {

    const dataString = JSON.stringify(data);
    const initialArray = JSON.parse(dataString);

    const genres = ["Action", "Adventure", "Animation", "Comedy",
                    "Crime", "Documentary", "Drama", "Family", "Fantasy",
                    "History", "Horror", "Music", "Mystery", "Romance",
                    "Science Fiction", "Thriller", "TV Movie", "War", "Western"
                    ];

    var svg = d3.select('#svg svg')
        .attr('width', 1600)
        .attr('height', 2000)
        .attr('viewBox', '0 0 1600 2000');

    svg.selectAll("*").remove(); // Clear previous content

    const tooltipGroup = svg.append('g')
        .attr('transform', 'translate(10, 35)')
        .style('opacity', 0)
        .style('pointer-events', 'none');

    const tooltipTitle = tooltipGroup.append('text')
        .attr('x', 0)
        .attr('y', 0)
        .attr('fill', 'white')
        .attr('font-family', 'Helvetica Neue, Arial')
        .attr('font-size', '32px')
        .attr('class', 'tooltip-description');

    const starsGroup = tooltipGroup.append('g')
        .attr('transform', 'translate(0, 0)');


    for(let i = 0; i < genres.length; i++){
        let genreName = genres[i];
        let genreData = initialArray.filter(d => {
            return d.genres && d.genres.includes(genreName);
        });

        if (genreData.length > 0) {
            generateGenreSim(i, genreName, genreData, svg, tooltipGroup, tooltipTitle, starsGroup);
        }
    }
}

async function clearSVG(){
    var svg = d3.select('#svg svg')
        .selectAll("*")
        .remove();
}

const ratingsData = await getRatings();

// console.log(ratingsData);

generateMovies(ratingsData);

// separateByRating(ratingsData);

// Button
const button = document.getElementById("sortRating");
const buttong = document.getElementById("sortGenre");

function sortByRating() {
    clearSVG();
    separateByRating(ratingsData);
    button.textContent = "View as Whole";
    buttong.textContent = "Sort by Genre";
    button.onclick = viewAsWhole;
}

function sortByGenre() {
    clearSVG();
    separateByGenre(ratingsData);
    buttong.textContent = "View as Whole";
    button.textContent = "Sort by Rating";
    buttong.onclick = viewAsWhole;
}

function viewAsWhole() {
    clearSVG();
    generateMovies(ratingsData);
    button.textContent = "Sort by Rating";
    buttong.textContent = "Sort by Genre";
    button.onclick = sortByRating;
    buttong.onclick = sortByGenre;
}

button.onclick = sortByRating;
buttong.onclick = sortByGenre;

buttong.onmouseover = function () {
    buttong.style.color = "#a5a5a5";
};

buttong.onmouseout = function () {
    buttong.style.color = "white";
};

button.onmouseover = function () {
    button.style.color = "#a5a5a5";
};

button.onmouseout = function () {
    button.style.color = "white";
};









