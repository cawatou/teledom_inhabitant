$(function () {
	$('.answer').draggable({
		revert: "invalid",
		axis: "x"
	});
	$(".arrows.aleft").droppable({
		accept: ".answer",
		drop: function (event, ui) {
			$('.answer,.arrows').toggleClass('hidden');
			$('.buttons').toggleClass('active');
			$('header .t').toggleClass('yes');
		}
	});
	$('.notanswer').draggable({
		revert: "invalid",
		axis: "x"
	});
	$(".arrows.aright").droppable({
		accept: ".notanswer",
		drop: function (event, ui) {
			$('.answer,.arrows,.notanswer,.buttons').toggleClass('hidden');
			$('header .t').toggleClass('no');
		}
	});
	$('.door').draggable({
		revert: "invalid",
		axis: "y"
	});

	$("main").droppable({
		accept: ".door",
		drop: function (event, ui) {
			$('.answer,.arrows,.notanswer,.buttons').addClass('hidden');
			$('.door').toggleClass('active');
		}
	});
});
$('.microphone,.video').on('click', function (e) {
	$(this).toggleClass('off');
});

$(function () {
	var count = 0;
	$(".buttons").swipe({
		swipeRight: function (event, direction, distance, duration, fingerCount) {

		},
		threshold: 0
	});
	$(".buttons").swipe({
		swipeLeft: function (event, direction, distance, duration, fingerCount) {
			$('body').toggleClass('yes');
		},
		threshold: 0
	});
	$(".door").swipe({
		swipeUp: function (event, direction, distance, duration, fingerCount) {

		},
		threshold: 0
	});
});
