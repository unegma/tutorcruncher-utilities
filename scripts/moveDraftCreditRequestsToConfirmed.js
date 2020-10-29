let names = [{name: "Name1"}, {name: "Name2"}];

// script for checking all of the draft credit requests so can move out of drafts
// this is currently used until a filter is built
// https://secure.tutorcruncher.com/accounting/proforma-invoices/staging/
names.forEach(name => {

  let docNameElements = document.getElementsByClassName('nav-ignore');

  for (let docNameElement of docNameElements) {
    if (docNameElement.innerHTML === name.name) {
      let checkbox = docNameElement.previousSibling.previousSibling;
      if(checkbox) { checkbox.checked = true; }
    }
  }

})

