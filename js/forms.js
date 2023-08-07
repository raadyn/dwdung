// scripts for (modal) windows on js
// use utils.js

//let modal_mode = false;         // flag that one of modal windows is activated

// function and argument which are assigned with a modal window
let var_func = null;        // some variable function for modal windows, for example
let var_arg = null;         // a variable argument for a variable function


// hide modal window and switch off modal mode (parameter - one of element located in form div)
function close_modal(elem)
{
    // hide_elem(get_ptag(elem, 'DIV'));   // find parent DIV and hide it
    //modal_mode = false;
    let pdiv = get_ptag(elem, 'DIV');
    let gray = document.querySelector('.gray');
    pdiv.classList.remove("active");
    gray.classList.remove("active");
};

// close parent div of element
function close_pdiv(elem)
{
    let pdiv = get_ptag(elem, 'DIV');
    if (pdiv != null)
        hide_elem(pdiv);
};

// show window and focus on it first button
function show_modal(window)
{
    let btn = window.getElementsByTagName('button')[0];
    show_elem(window);
    if (btn != null)
        btn.focus();
};

// show modal window for entering number and perform action by function func (func is called with entered number)
// you need copy a window-div to html page, and associate a variable with this window
function enter_number(window, numb, func)
// numb is a pre-entered number, func - is function which called after sucessfull procedings of the window
{
    var_func = func;
    let frm = window.getElementsByTagName('form')[0];
    frm.val.value = numb;
    show_elem(window);
    frm.val.focus();
    //modal_mode = true;
};

// confirm entered in modal window value and call function with this value
// return false to stop sending form
function confirm_val(obj)
// obj is a form there submit was executed
{
    var_func(obj.val.value, var_arg);
    hide_elem(get_ptag(obj, 'DIV'));
    obj.val.blur();
    //modal_mode = false;
    return false;
};

// copy these forms to use it in your scripts, don't forget to get them by getElementByID
/*
        <div id="numb_input">
            <span>Enter number: </span>
            <form onsubmit="return confirm_val(this);">
                <input name="val" type="number" value="1" onfocus="select(this);" onkeydown="if (event.keyCode == 27) close_modal(this); event.stopPropagation();" />
                <input type="submit" value="OK" />
                <button type="button" onclick="close_modal(this);">cancel (Esc)</button>
            </form>
        </div>

 */

// read about creation of modal forms:
// https://learn.javascript.ru/forms-submit