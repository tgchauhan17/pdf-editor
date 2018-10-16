var __PDF_DOC,
	__CURRENT_PAGE,
	__TOTAL_PAGES;

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
                    textLayerDiv.setAttribute("id", "textLayer");

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
	});

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