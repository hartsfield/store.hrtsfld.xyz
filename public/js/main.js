var stream = [];
var cart = JSON.parse(localStorage.getItem("cart")) || [];

function setCategory(category) {
  navLis = document.getElementsByClassName("navli");
  for (i=0;i<navLis.length;i++) {
    navLis[i].style.background = "#fff4e3";
    navLis[i].style.color = "rgb(119 107 86)";
  }

  if (category == "PRODUCTS") {
    document.getElementById("productsLi").style.background =  "rgb(119 107 86)";
    document.getElementById("productsLi").style.color = "#fff4e3";
  } else if (category == "QUESTIONS") {
    document.getElementById("questionsLi").style.background = "rgb(119 107 86)";
    document.getElementById("questionsLi").style.color = "#fff4e3";
  } else {
    document.getElementById("contactLi").style.background = "rgb(119 107 86)";
    document.getElementById("contactLi").style.color = "#fff4e3";
  }
}

// function isScrolledIntoView(elem)
// {
//     var docViewTop = $(window).scrollTop();
//     var docViewBottom = docViewTop + $(window).height();

//     var elemTop = $(elem).offset().top;
//     var elemBottom = elemTop + $(elem).height();

//     return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
// }

// define an observer instance
var observer = new IntersectionObserver(onIntersection, {
  root: null,   // default is the viewport
  threshold: 0.1 // percentage of target's visible area. Triggers "onIntersection"
})

// callback is called on intersection change
function onIntersection(){
  nextPage();
}

function getPage(page) {
  setCategory(page);
}

function getStream(category) {
  var xhr = new XMLHttpRequest();

  xhr.open("POST", "/api/getStream");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onload = function() {
    if (xhr.status === 200) {
      var res = JSON.parse(xhr.responseText);
      if (res.success == "true") {
        var listDiv = document.getElementById("streamOuter");
        listDiv.innerHTML = res.template;
        window.history.pushState({}, "page", "/#/" + category);
        window.scrollTo(0, 0);
        document.getElementById("pageName").innerHTML = category;
        stream = JSON.parse(res.stream);
        setButtons();
        setCategory(category);
        hideSidebar();
      } else {
        // handle error
      }
    }

  };

  // For now, all we're sending is a username and password, but we may start
  // asking for email or mobile number at some point.
  xhr.send(JSON.stringify({
    category: category
  }));
  // var sb = document.getElementById("sidebar").offsetWidth;
  // var s = document.getElementById("sizer");
  // w = (window.innerWidth - (sb)) + "px";
  // mL = (sb) + "px";
  // s.style.width = w;
  // s.style.marginLeft = mL;
}

function nextPage() {
  var xhr = new XMLHttpRequest();

  xhr.open("POST", "/api/nextPage");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onload = function() {
    if (xhr.status === 200) {
      var res = JSON.parse(xhr.responseText);
      console.log(JSON.parse(res.stream));
      if (res.success == "true") {
        var listDiv = document.getElementById("streamOuter");
        var nextPageDiv = document.createElement("div");
        nextPageDiv.innerHTML = res.template;
        nextPage.id = "page_" + stream.length;
        nextPageDiv.children[0].style.paddingTop ="0em";
        nextPageDiv.children[0].children[0].style.paddingTop ="0em";
        listDiv.appendChild(nextPageDiv);
        // listDiv.insertAdjacentHTML("beforeend", res.template);
        stream = stream.concat(JSON.parse(res.stream));
        setButtons();
        if (res.lastPage == "true") {
          // To stop observing:
          observer.unobserve(document.querySelector(".footLogo"));
        }
      } else {
        // handle error
        console.log("error");
      }
    }
  };

  // For now, all we're sending is a username and password, but we may start
  // asking for email or mobile number at some point.
  xhr.send(JSON.stringify({
    number: stream.length,
    category: "PRODUCTS",
  }));
}


function like(trackID, isLoggedIn) {
  if (isLoggedIn == "false") {
    showAuth();
  } else {
    var xhr = new XMLHttpRequest();

    xhr.open("POST", "/api/like");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = function() {
      if (xhr.status === 200) {
        var res = JSON.parse(xhr.responseText);
        if (res.success == "false") {
          // If we aren't successful we display an error.
          document.getElementById("errorField").innerHTML = res.error;
        } else if (res.isLiked == "true") {
          document.getElementById("heart_" + trackID).style.backgroundImage = "url(/public/assets/heart_red.svg)";
        } else if (res.isLiked == "false") {
          document.getElementById("heart_" + trackID).style.backgroundImage = "url(/public/assets/heart_black.svg)";
        } else {
          // handle error
          console.log("error");
        }
      }
    };

    // For now, all we're sending is a username and password, but we may start
    // asking for email or mobile number at some point.
    xhr.send(JSON.stringify({
      id: trackID
    }));

  }
}

var expanded = [];
function expando(eid) {
  var expand = document.getElementById("post_"+eid);
  pic = document.getElementById("postImg_" + eid);
  bottompic = document.getElementById("postImgAfter_" + eid);
  bottompicInner = document.getElementById("imgBottom_" + eid);
  cartButt = document.getElementById("addToCart_" + eid);
  info = document.getElementById("postInfo_" + eid);
  description= document.getElementById("pd_" + eid);
  if (expanded.indexOf(eid) != -1) {
    expand.style.height = "unset";
    expand.style.display = "flex";
    pic.style.display = "inline-flex";
    bottompic.style.display = "none"
    bottompicInner.style.display = "none"
    info.style.paddingLeft = "1em";
    info.style.paddingBottom = "unset";
    cartButt.style.display = "unset";
    cartButt.style.float = "unset";
    description.style.display = "none";
    expanded.splice(expanded.indexOf(eid), 1);
  } else {
    expand.style.display = "revert";
    expanded.active = eid;
    bottompic.style.display = "unset"
    bottompicInner.style.display = "unset"
    pic.style.display = "none";
    info.style.paddingLeft = "unset";
    info.style.paddingBottom = "1em";
    cartButt.style.display = "inline";
    cartButt.style.float = "right";
    description.style.display = "unset";
    expanded.push(eid);
  }
}

function setButtons() {
  cart.forEach((z) => {
    for (i=0;i<stream.length;i++) {
      if (stream[i].ID == z.ID) {
        document.getElementById("addToCart_" + stream[i].ID).innerHTML = "remove";
        document.getElementById("addToCart_" + stream[i].ID).style.background = "#b96100";
        document.getElementById("addToCart_" + stream[i].ID).style.color = "#ffecec";
        break;
      }
    }
  });
}

function addToCart(ID) {
  ind = cart.findIndex(x => x.ID === ID);
  if (ind != -1) {
    if (cart[ind].quantity == 1) {
      cart.splice(ind, 1);
      document.getElementById("addToCart_" + ID).innerHTML = "add to cart";
      document.getElementById("addToCart_" + ID).style.background = "#9abc2e";
    } else {
      cart[ind].quantity = cart[ind].quantity - 1;
    }
  } else {
    cart.push(stream[stream.findIndex(x => x.ID === ID)]);
    cart[cart.length - 1].quantity = 1;
    document.getElementById("addToCart_" + ID).innerHTML = "remove";
    document.getElementById("addToCart_" + ID).style.background = "#b96100";
    document.getElementById("addToCart_" + ID).style.color = "#ffecec";
  }
  updateCartTotal();
}

function addQuantity(key) {
  ci = cart.indexOf(stream[key]);
  cart[ci].quantity = cart[ci].quantity + 1;
}

function removeQuantity(key) {
  if (cart[key].quantity >= 1) {
    cart[key].quantity = cart[key].quantity - 1;
  }
  if (cart[key].quantity <= 0) {
    removeItemFromCart[key];
  }
}

// Create our number formatter.
const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});




var total;
function updateCartTotal() {
  total = 0.00;
  for (i=0;i<cart.length;i++) {
    total = total + (parseFloat(cart[i].price.substring(1)) * cart[i].quantity);
  }

  total = formatter.format(total);
  document.getElementById("cartButt").innerHTML = total;
  if (parseFloat(total.substring(1)) <= 0) {
    document.getElementById("cartButt").style.display = "none";
  } else {
    document.getElementById("cartButt").style.display = "unset";
  }
  localStorage.setItem("cart", JSON.stringify(cart));      
}

function removeItemFromCart(key) {
  cart.splice(key, 1);
  document.getElementById("cartItem_" + key).remove();
  updateCartTotal();
  document.getElementById("cartTotal").innerHTML = "Checkout: " + total;
}

function buildCartMarkup() {
  cartDiv = document.createElement("div");
  cartDiv.className = "cartDiv";
  cartDiv.id = "cartDiv";
  cartTotal = document.createElement("div");
  cartTotal.className = "cartTotal";
  cartTotal.id = "cartTotal";
  cartTotal.innerHTML = "Checkout: " + total;
  for (i=0;i<cart.length;i++) {
    cartItem = document.createElement("div");
    cartItem.className = "cartItem";
    cartItem.id = "cartItem_" + i;

    itemName= document.createElement("div");
    itemName.className = "cartItemName";
    itemName.innerHTML = cart[i].product;

    itemPrice = document.createElement("div");
    itemPrice.className = "cartItemPrice";
    itemPrice.id = "itemPrice_" + cart[i].ID;
    itemPrice.innerHTML = formatter.format(
      parseFloat(cart[i].price.substring(1)) * parseInt(cart[i].quantity)
    );

    remove = document.createElement("div");
    remove.className = "removeFromCartButt";
    remove.innerHTML = "x";
    remove.setAttribute("onclick","removeItemFromCart(" + i + ")");

    select = document.createElement("select");
    select.className = "quantity";
    select.id = "quantity_" + cart[i].ID;
    select.setAttribute("onchange","updateQuantity(" + i + ")");
    for (j=0;j<cart[i].stocked;j++) {
      option = document.createElement("option");
      option.value = j + 1;
      option.innerHTML = j + 1;
      select.appendChild(option);
    }

    select.selectedIndex = cart[i].quantity - 1;
    cartItem.appendChild(itemName);
    cartItem.appendChild(select);
    cartItem.appendChild(itemPrice);
    cartItem.appendChild(remove);

    cartDiv.appendChild(cartItem);
  }
  cartDiv.appendChild(cartTotal);
  return cartDiv;
}

function updateQuantity(key) {
  var selectBox = document.getElementById("quantity_" + cart[key].ID);
  var selectedValue = selectBox.options[selectBox.selectedIndex].value;

  cart[key].quantity = selectedValue;

  var itemPrice = document.getElementById("itemPrice_" + cart[key].ID);
  itemPrice.innerHTML = formatter.format(
    parseFloat(cart[key].price.substring(1)) * selectedValue
  );

  updateCartTotal();
  cartTotal = document.getElementById("cartTotal");
  cartTotal.innerHTML = "Checkout: " + total;
}

function toggleCart() {
  pageName = document.getElementById("pageName");
  streamDiv = document.getElementById("streamOuter");
  streams = document.getElementsByClassName("stream");
  if (pageName.innerHTML == "Cart") {
    for (i=0;i<streams.length; i++) {
      streams[i].style.display = 'revert';
    }
    pageName.innerHTML = "PRODUCTS";
    document.getElementById("cartDiv").remove();
    window.history.pushState({}, "page", "/#/PRODUCTS");
  } else {
    for (i=0;i<streams.length; i++) {
      streams[i].style.display = 'none';
    }
    cartDiv = buildCartMarkup();
    pageName.innerHTML = "Cart";
    streamDiv.appendChild(cartDiv);
    window.history.pushState({}, "page", "/#/cart");
  }
}

