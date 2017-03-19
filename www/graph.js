document.addEventListener('DOMContentLoaded', () => {
	let margin = {
		top: 20,
		right: 20,
		bottom: 30,
		left: 30
	};

	let width  = 0.97 * window.innerWidth  - margin.left - margin.right;
	let height = 0.5  * window.innerHeight - margin.top  - margin.bottom;

	let x = d3.scaleTime().range([0, width]);
	let y = d3.scaleLinear().range([height, 0]);

	let xAxis = d3.axisBottom()
		.scale(x);
	let yAxis = d3.axisLeft()
		.scale(y);

	let svg = d3.select('#graph')
		.append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
		.append('g')
			.attr('transform', "translate(" + margin.left + ", " + margin.top + ")");

	let line = d3.line()
		.x((d) => x(new Date(d.timestamp)))
		.y((d) => y(+d.value));

	svg.append('g')
		.attr('class', 'x axis')
		.attr('transform', "translate(0, " + height + ")")
		.call(xAxis);

	svg.append('g')
		.attr('class', 'y axis')
		.call(yAxis)
		.append('text')
			.attr('transform', 'rotate(-90)')
			.attr('y', 6)
			.attr('dy', '.71em')
			.style('text-anchor', 'end')
			.text('Value');

	svg.append('path')
		.attr('class', 'line');

	var entries = [];

	var maxCount = 100;
	var maxTime = 4000;

	function updateGraph() {
		var filtered = entries
			.slice(-maxCount)
			.filter((entry) => maxTime < 1 || new Date() - new Date(entry.timestamp) <= maxTime);

		x.domain(d3.extent(filtered, (entry) => new Date(entry.timestamp)));
		y.domain(d3.extent(filtered, (entry) => +entry.value));

		svg.select('.x.axis').call(xAxis);
		svg.select('.y.axis').call(yAxis);
		svg.select('.line').attr('d', line(filtered));
	}

	$('#time-slider').on('input', function() {
		maxTime = $(this).val();
		$('#time-val').text(maxTime);
		updateGraph();
	});

	$('#count-slider').on('input', function() {
		maxCount = $(this).val();
		$('#count-val').text(maxCount);
		updateGraph();
	});

	(function getDatum() {
		$.get('ui/data', {}, (data) => {
			entries.push({
				timestamp: +data.data[0],
				value: +data.data[1]
			});
			updateGraph();
			setTimeout(getDatum, 0);
		});
	})();
});
