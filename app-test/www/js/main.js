$('document').ready(function () {
	var trigger = $('#hamburger'),
		isClosed = true;

	trigger.click(function () {
		burgerTime();
	});

	function burgerTime() {
		if (isClosed == true) {
			trigger.removeClass('is-open');
			trigger.addClass('is-closed');
			isClosed = false;
			$('.menu,header,body').removeClass('active');
		} else {
			trigger.removeClass('is-closed');
			trigger.addClass('is-open');
			isClosed = true;
			$('.menu,header,body').addClass('active');
		}
	}

});

function active(elem) {

	var a = document.getElementsByClassName('item');
	for (i = 0; i < a.length; i++) {
		a[i].classList.remove('active')
	}

	elem.classList.add('active');
}

var btn = document.getElementsByClassName('btn');
var pop = document.getElementsByClassName('popup');

btn[0].onclick = function () {
	pop[0].classList.add("hidden");
}

btn[1].onclick = function () {
	pop[0].classList.add("hidden");
}

btn[2].onclick = function () {
	pop[1].classList.add("hidden");
}

btn[3].onclick = function () {
	pop[1].classList.add("hidden");
}

btn[4].onclick = function () {
	pop[2].classList.add("hidden");
}

btn[5].onclick = function () {
	pop[2].classList.add("hidden");
}

btn[6].onclick = function () {
	pop[3].classList.add("hidden");
}

btn[7].onclick = function () {
	pop[3].classList.add("hidden");
}

btn[8].onclick = function () {
	pop[4].classList.add("hidden");
}

btn[9].onclick = function () {
	pop[4].classList.add("hidden");
}

/*
var btn = document.querySelectorAll('.btn');
var pop = document.querySelectorAll('.popup');
[].forEach.call(btn, function (el) {
	//вешаем событие
	el.click = function (e) {
		[].pop.classList.add("hidden");
	}
});
*/
