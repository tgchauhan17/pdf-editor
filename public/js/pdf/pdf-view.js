var __PDF_DOC,
	__CURRENT_PAGE,
	__TOTAL_PAGES,
	__PAGE_COORDINATES;

function showPDF(pdf_url) {
	$("#pdf-loader").show();
    __PAGE_COORDINATES = [];
    PDFJS.disableStream = true;
	PDFJS.getDocument({ url: pdf_url }).then(function(pdf) {
		__PDF_DOC = pdf;
		__TOTAL_PAGES = __PDF_DOC.numPages;

		// Hide the pdf loader and show pdf container in HTML
		$("#pdf-loader").hide();
		$("#pdf-contents").show();
		$("#pdf-total-pages").text(__TOTAL_PAGES);

		// Get div#container and cache it for later use
        var container = document.getElementById('page');

          // Loop from 1 to total_number_of_pages in PDF document
          for (var i = 1; i <= pdf.numPages; i++) {

              // Get desired page
              pdf.getPage(i).then(function(page) {

                //var scale = 1.9781512605042018;
                var scale = 1.81;
                var viewport = page.getViewport(scale);
                var pageContainer = document.createElement("div");
                var pageWrap = document.createElement("div");

                // This will keep positions of child elements as per our needs
                pageContainer.setAttribute("class", "page-container");
                pageWrap.setAttribute("class", "page-wrap rendered");

                // Append div within div#container
                container.insertBefore(pageContainer,document.getElementById("page-container-last"));

                // Create a new Canvas element
                var canvas = document.createElement("canvas");
                canvas.setAttribute("id", "canvas-" + (page.pageIndex + 1));

                var pageNoLabel = document.createElement("div");
                pageNoLabel.append((page.pageIndex + 1));
                pageNoLabel.setAttribute("class", "page-number-label");
                pageContainer.appendChild(pageNoLabel);
                pageContainer.appendChild(pageWrap);
                pageWrap.appendChild(canvas);

                var context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                var renderContext = {
                  canvasContext: context,
                  viewport: viewport
                };
                // Render PDF page
                page.render(renderContext).then(function() {

                    // Get text-fragments
                    return page.getTextContent();
                  })
                  .then(function(textContent) {
                    drawAndSaveCoordinates(page.pageIndex + 1);
                  });
              });
             }
	}).catch(function(error) {
		// If error re-show the upload button
		$("#pdf-loader").hide();
		$("#upload-button").show();
		alert(error.message);
	});

}

function drawAndSaveCoordinates(pageId) {
        var canvasId = "canvas-"+pageId;
        var canvas = document.getElementById(canvasId);
        var coordinates = [];
        var scrollTop = $(window).scrollTop(), elementOffsetTop = $("#"+canvasId).offset().top, distanceY = (elementOffsetTop - scrollTop);
        var scrollLeft = $(window).scrollLeft(), elementOffsetLeft = $("#"+canvasId).offset().left, distanceX = (elementOffsetLeft - scrollLeft);
        function setMousePosition(e) {
            var ev = e || window.event; //Moz || IE
            if (ev.pageX) { //Moz
                mouse.x = ev.pageX + scrollLeft + ((mouse.x - mouse.startX - distanceX < 0) ? (10) : 0);
                mouse.y = ev.pageY + scrollTop + ((mouse.y - mouse.startY - distanceY < 0) ? (10) : 0);
            } else if (ev.clientX) { //IE
                mouse.x = ev.clientX + scrollLeft;
                mouse.y = ev.clientY + scrollTop;
            }
        };

        var mouse = {
            x: 0,
            y: 0,
            startX: 0,
            startY: 0
        };
        var element = null;

        canvas.onmousemove = function (e) {
            setMousePosition(e)
            if (element !== null) {
                element.style.width = Math.abs(mouse.x - mouse.startX - distanceX - 10) + 'px';
                element.style.height = Math.abs(mouse.y - mouse.startY - distanceY - 10) + 'px';
                element.style.left = (mouse.x - mouse.startX - distanceX < 0) ? mouse.x - distanceX - 10 + 'px' : mouse.startX + 'px';
                element.style.top = (mouse.y - mouse.startY - distanceY < 0) ? mouse.y - distanceY - 10 + 'px' : mouse.startY + 'px';
            }
        }

    	var startFinishedCoordinates = [];

        canvas.onclick = function (e) {
            if (element !== null) {
                element = null;
                canvas.style.cursor = "default";
                console.log("finsihed.");
                startFinishedCoordinates.push(mouse.x);
                startFinishedCoordinates.push(mouse.y);
                coordinates.push(startFinishedCoordinates);
                __PAGE_COORDINATES[pageId-1] = coordinates
                console.log(__PAGE_COORDINATES);
                startFinishedCoordinates = [];

            } else {
                console.log("begun.");
                mouse.startX = mouse.x - distanceX;
                mouse.startY = mouse.y - distanceY;
                element = document.createElement('div');
                element.className = 'rectangle'
                element.style.left = mouse.x - distanceX + 'px';
                element.style.top = mouse.y - distanceY + 'px';
                canvas.parentElement.appendChild(element)
                canvas.style.cursor = "crosshair";
                startFinishedCoordinates.push(mouse.startX);
                startFinishedCoordinates.push(mouse.startY);
                console.log(mouse.startX+" "+mouse.startY);
            }
        }
    }


// Upon click this should should trigger click on the #file-to-upload file input element
$("#upload-button").on('click', function() {
	$("#file-to-upload").trigger('click');
});

// When user chooses a PDF file
$("#file-to-upload").on('change', function() {
	// Validate whether PDF
    if(['application/pdf'].indexOf($("#file-to-upload").get(0).files[0].type) == -1) {
        alert('Error : Not a PDF');
        return;
    }

	$("#upload-button").hide();

	// Send the object url of the pdf
	showPDF(URL.createObjectURL($("#file-to-upload").get(0).files[0]));
});