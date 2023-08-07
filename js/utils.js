function dec_to_hex(n)
{
    return Number(n).toString(16);
};

function add_child(tag, txt, cls, parent, at_first = false)
// add child to DOM element
{
    let elem = document.createElement(tag);
    elem.innerHTML = txt;
    if (cls)
        elem.className = cls;
    if (at_first)
    {
        let first = parent.firstChild;
        parent.insertBefore(elem, first);
    }
    else
        parent.appendChild(elem);
    return elem;
};

function add_child_before(tag, txt, cls, node)
// similar to 'add_child' but insert before some node
{
    let elem = document.createElement(tag);
    elem.innerHTML = txt;
    elem.className = cls;
    let parent = node.parentNode;
    parent.insertBefore(elem, node);
    return elem;
};

function add_img(src, cls, parent)
// similar to add_child but specific for <IMG>
{
    let img = document.createElement('img');
    img.src = src;
    if (cls)
        img.className = cls;
    parent.appendChild(img);
    return img;
};

function add_child_coord(x, y, tag, txt, cls, parent)
// add child to DOM element with desired absolute coordinates
{
    let elem = document.createElement(tag);
    elem.innerHTML = txt;
    elem.className = cls;
    elem.style.left = x;
    elem.style.top = y;
    elem.style.position = 'absolute';
    parent.appendChild(elem);
    return elem;
};

// functions for hide and show elements:
function hide_elem(elem) {
    //elem.style.visibility = 'hidden';
    elem.style.display = 'none';
};

function show_elem(elem) {
    //elem.style.visibility = 'visible';
    elem.style.display = 'block';
};

function clear_childs(obj)
{
    while (obj.firstChild) obj.removeChild(obj.firstChild);
};

// delete object
function del_obj(obj)
{
    obj.parentNode.removeChild(obj);
};

// this function is replaced by more general 'get_ptag'
/*
// find div at which this element is lockated
function get_div(obj) {
    let node = obj.parentNode;
    while ((node != null) && (node.tagName != 'DIV'))
        node = node.parentNode;
    return node;
}
*/

function fill_table(width, height, cls, src, tabl)
// create width*height cells with image with src=src (cls = class of cell)
{
    let cl_str = '';
    if (cls != '')
        cl_str = ' class="' + cls + '"';
    let txt = '<tr>';
    for (let i = 0; i < width; i++)
        txt += '<td' + cl_str + '><img src="' + src + '" ></td>';
    txt += '</tr>';
    let rows = '';
    for (i = 0; i < height; i++)
        rows += txt;
    tabl.innerHTML = rows;
};

function fill_table_cont(width, height, cls, cont, tabl)
// create width*height cells with arbitrary content (cls = class of cell)
{
    let cl_str = '';
    if (cls != '')
        cl_str = ' class="' + cls + '"';
    let txt = '<tr>';
    for (let i = 0; i < width; i++)
        txt += '<td' + cl_str + '>' + cont + '</td>';
    txt += '</tr>';
    let rows = '';
    for (i = 0; i < height; i++)
        rows += txt;
    tabl.innerHTML = rows;
};

// fill images in table cells [x0,y0,xn,yn) with given src
function fill_table_rect(table, x0, y0, xn, yn, src)
{
    let i, j;
    for (i = x0; i < xn; i++)
        for (j = y0; j < yn; j++)
            table.rows[j].cells[i].firstChild.src = src;
};

function shift_coord(coord, delta)
// change coordinates of object on delta px
{
    let val = parseInt(coord);
    val = val + delta;
    return val + 'px';
};

// shift content of table and fill new cells with content=cont and class=cls
function shift_table_cont(dx, dy, cls, cont, table)
{
    let i, j, n;
    let cl_str = '';
    if (cls != '')
        cl_str = ' class="' + cls + '"';
    let cell = '<td' + cl_str + '>' + cont + '</td>';
    let row;

    if (dy != 0)
    {
        let ins_ind;    // insert index
        let del_ind;    // delete index
        let row_cont = '';
        for (i = 0; i < table.rows[0].cells.length; i++)
            row_cont += cell;

        if (dy > 0) {
            n = dy;
            ins_ind = -1;
            del_ind = 0;
        }
        else {
            n = -dy;
            ins_ind = 0;
            del_ind = -1;
        }

        for (i = 0; i < n; i++)
        {
            row = table.insertRow(ins_ind);
            row.innerHTML = row_cont;
            table.deleteRow(del_ind);
        }
    }

    if (dx != 0)
    {
        for (i = 0; i < table.rows.length; i++)
        {
            row = table.rows[i];
            for (j = 0; j < Math.abs(dx); j++)
            {
                // positive shift
                if (dx > 0) {
                    add_child('td', cont, cls, row);    // add cell to the end
                    row.removeChild(row.firstElementChild);   // remove the first cell
                }
                else {
                    // opposite
                    add_child_before('td', cont, cls, row.firstElementChild);   // add cell to beginning
                    row.removeChild(row.lastChild);         // remove the last cell
                }
            }
        }
    }
}

// search cell of the table
function find_cell(x, y, table)
{
    return table.rows[y].cells[x];
};


// find parent element with desired tag name
function get_ptag(obj, tagname)
{
    let node = obj.parentNode;
    while ((node != null) && (node.tagName != tagname))
        node = node.parentNode;
    return node;
};

// split txt into an array by the specified  delimiter (split_symb) and then each element into subarray (by inern_split delimiter),
// iterate by the first array and call func with subarray parameter
// up to 4 additional parameters for func call

// ....
// split_symb and intern_split are symbols which are delimiter for txt and txt[] correspondingly
function parse_iterator(split_symb, intern_split, txt, func)
{
    let arr;
    let items = txt.split(split_symb);
    for (let i = 0; i < items.length - 1; i++)  // length - 1 as the last split_symb usually finalize string
    {
        if (items[i] == '')
            continue;
        arr = items[i].split(intern_split);
        func(i, arr, arguments[4], arguments[5], arguments[6], arguments[7]);
    }
};

function create_floating_text(text, height, cls = false, x = false, y = false, speed=20)
{
    // Create a new div element for the floating text
    const div = document.createElement('div');
    div.textContent = text;

    // Set the CSS properties of the floating text
    if (x)
        div.style.left = x + 'px';
    if (y)
        div.style.top = y + 'px';

    if (cls)
        div.className = cls;

    // Add the floating text to the document body
    document.body.appendChild(div);

    // Move the floating text up and fade it out
    setTimeout(() => {
        div.style.transform = 'translateY(' + height + 'px)';
        //div.style.opacity = 0;
    }, speed);

    // Remove the floating text from the document body after 2 seconds
    setTimeout(() => {
        div.remove();
    }, 1000);
}
