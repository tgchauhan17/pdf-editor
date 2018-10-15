var __PDF_DOC,
	__CURRENT_PAGE,
	__TOTAL_PAGES,
	__PAGE_RENDERING_IN_PROGRESS = 0,
	__CANVAS = $('#pdf-canvas').get(0),
	__CANVAS_CTX = __CANVAS.getContext('2d');

function showPDF(pdf_url) {
	$("#pdf-loader").show();

    PDFJS.disableStream = true;
	PDFJS.getDocument({ url: pdf_url }).then(function(pdf) {
		__PDF_DOC = pdf;
		__TOTAL_PAGES = __PDF_DOC.numPages;

		// Hide the pdf loader and show pdf container in HTML
		$("#pdf-loader").hide();
		$("#pdf-contents").show();
		$("#pdf-total-pages").text(__TOTAL_PAGES);

		// Show the first page
		//showPage(1);


		// Get div#container and cache it for later use
          var container = document.getElementById('page');

          // Loop from 1 to total_number_of_pages in PDF document
          for (var i = 1; i <= pdf.numPages; i++) {

              // Get desired page
              pdf.getPage(i).then(function(page) {

                var scale = 1.9781512605042018;
                var viewport = page.getViewport(scale);
                var pageContainer = document.createElement("div");
                var pageWrap = document.createElement("div");

                // Set id attribute with page-#{pdf_page_number} format
                //pageContainer.setAttribute("id", "page-" + (page.pageIndex + 1));

                // This will keep positions of child elements as per our needs
                pageContainer.setAttribute("class", "page-container");
                pageWrap.setAttribute("class", "page-wrap rendered");


                // Append div within div#container
                container.insertBefore(pageContainer,document.getElementById("page-container-last"));

                // Create a new Canvas element
                var canvas = document.createElement("canvas");
                canvas.setAttribute("id", "page-" + (page.pageIndex + 1));

                var pageToolsMenu = document.createElement("div");
                var btnGroup = document.createElement("div");
                var button = document.createElement("button");
                var ifa = document.createElement("i");


                ifa.setAttribute("class", "fa fa-trash-o");
                button.appendChild(ifa);
                button.setAttribute("type", "button");
                button.setAttribute("class", "btn btn-default btn-xs");
                button.setAttribute("title", "Delete PDF Page");
                button.setAttribute("data-tool", "delete-page");
                //btnGroup.appendChild(button);
                btnGroup.setAttribute("class", "btn-group btn-group-vertical");
                btnGroup.setAttribute("role", "group");
                btnGroup.setAttribute("aria-label", "Page Tools");
                pageToolsMenu.appendChild(btnGroup);
                pageToolsMenu.setAttribute("class", "page-tools-menu");

                var pageNoLabel = document.createElement("div");
                pageNoLabel.append((page.pageIndex + 1));
                pageNoLabel.setAttribute("class", "page-number-label");
                //pageNoLabel.text(i);

                // Append within div
                pageContainer.appendChild(pageToolsMenu);
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
                    // Create div which will hold text-fragments
                    var textLayerDiv = document.createElement("div");

                    // Set it's class to textLayer which have required CSS styles
                    textLayerDiv.setAttribute("class", "textLayer");

                    // Append newly created div in `div#page-#{pdf_page_number}`
                    pageWrap.appendChild(textLayerDiv);

                    // Create new instance of TextLayerBuilder class
                    var textLayer = new TextLayerBuilder({
                      textLayerDiv: textLayerDiv,
                      pageIndex: page.pageIndex,
                      viewport: viewport
                    });

                    // Set text-fragments
                    textLayer.setTextContent(textContent);
                    console.log(textContent);
                    // Render text-fragments
                    textLayer.render();
                  });
              });
             }



	}).catch(function(error) {
		// If error re-show the upload button
		$("#pdf-loader").hide();
		$("#upload-button").show();

		alert(error.message);
	});;
}

function showPage(page_no) {
	__PAGE_RENDERING_IN_PROGRESS = 1;
	__CURRENT_PAGE = page_no;

	// Disable Prev & Next buttons while page is being loaded
	$("#pdf-next, #pdf-prev").attr('disabled', 'disabled');

	// While page is being rendered hide the canvas and show a loading message
	$("#pdf-canvas").hide();
	$("#page-loader").show();

	// Update current page in HTML
	$("#pdf-current-page").text(page_no);

	// Fetch the page
	__PDF_DOC.getPage(page_no).then(function(page) {
		// As the canvas is of a fixed width we need to set the scale of the viewport accordingly
		var scale_required = __CANVAS.width / page.getViewport(1).width;

		// Get viewport of the page at required scale
		var viewport = page.getViewport(scale_required);

		// Set canvas height
		__CANVAS.height = viewport.height;

		var renderContext = {
			canvasContext: __CANVAS_CTX,
			viewport: viewport
		};

		// Render the page contents in the canvas
		page.render(renderContext).then(function() {
			__PAGE_RENDERING_IN_PROGRESS = 0;

			// Re-enable Prev & Next buttons
			$("#pdf-next, #pdf-prev").removeAttr('disabled');

			// Show the canvas and hide the page loader
			$("#pdf-canvas").show();
			$("#page-loader").hide();
		});

		// Extract the text
        PDFJS.getDocument(URL.createObjectURL($("#file-to-upload").get(0).files[0])).then(function (PDFDocumentInstance) {

            var totalPages = PDFDocumentInstance.pdfInfo.numPages;

            // Extract the text
            getPageText(page_no , PDFDocumentInstance).then(function(textPage){
                // Show the text of the page in the console
                console.log(textPage);
            });

        }, function (reason) {
            // PDF loading error
            console.error(reason);
        });
	});
}

/**
 * Retrieves the text of a specif page within a PDF Document obtained through pdf.js
 *
 * @param {Integer} pageNum Specifies the number of the page
 * @param {PDFDocument} PDFDocumentInstance The PDF document obtained
 **/
function getPageText(pageNum, PDFDocumentInstance) {
    // Return a Promise that is solved once the text of the page is retrieven
    return new Promise(function (resolve, reject) {
        PDFDocumentInstance.getPage(pageNum).then(function (pdfPage) {
            // The main trick to obtain the text of the PDF page, use the getTextContent method
            pdfPage.getTextContent().then(function (textContent) {
                var textItems = textContent.items;
                var textStyles = textContent.styles;
                var finalString = "";

                // Concatenate the string of the item to the final string
                for (var i = 0; i < textItems.length; i++) {
                    var item = textItems[i];

                    finalString += item.str + " ";
                }
                for (var i = 0; i < textItems.length; i++) {
                   console.log("=> "+textStyles[i]);
                }

                // Solve promise with the text retrieven from the page
                resolve(finalString);
            });
        });
    });
}

jQuery('canvas').click(function(event) {
        jQuery( '.existingTextEdit' ).focusout();
        jQuery("#text-editable-menu").css("display","none");
        jQuery( '.existingTextEdit' ).attr("contenteditable", "false");
        jQuery('.existingTextEdit').removeClass("ui-draggable-disabled");
    console.log("------------> clicked out");
});

// Upon click this should should trigger click on the #file-to-upload file input element
// This is better than showing the not-good-looking file input element
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

// Previous page of the PDF
$("#pdf-prev").on('click', function() {
	if(__CURRENT_PAGE != 1)
		showPage(--__CURRENT_PAGE);
});

// Next page of the PDF
$("#pdf-next").on('click', function() {
	if(__CURRENT_PAGE != __TOTAL_PAGES)
		showPage(++__CURRENT_PAGE);
});