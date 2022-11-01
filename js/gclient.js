// functions and variables used only for dwdung client

// general data
let player_id;// = 1;
let key = 0;
let rc = 0;

// client states:
let trade_mode = false;

// elements
let id_label = null;        // element to show player id
let hp_label = null;        // to show your hp

let sug_div = null;             // div for items that you suggest to trade
let opsug_div = null;           // the same for oppoenent
let trade_div = null;             // div for inventory of trader
let trade_btn = null;            // button for trade
let trade_res = null;           // span for trade result
let agree_btn = null;           // btn for confirm trade exchange
let opponent_div = null;

let inv_div = null;             // div for inventory
let own_img = null;             // image of player
let log_div = null;             // div for logging game event


// client data
let vis_imgs = new Array();      // (visible images) array of images, which we need empty.png -> fog.png


// for forms and interfaces
let numb_input = null;      // div with form for entering numbers
let drag_img = null;        // dragged image from inventory


// functions:
function connect(login, passw, cls = 0)
// establish connection with server
{
    // external variables:
    player_id = login;
    id_label.innerHTML = player_id;
    url = serv_addr + player_id;
    //if (cls != 0)
    let conn_url = url + '&r=' + cls;

    source = new EventSource(conn_url + '&p=' + passw);
    source.onmessage = function (event)
    {
        parse_response(event.data);
    };
}

async function send_data(cmd)
// send cmd to server
{
    fetch(url + '&k=' + key, { method: "POST", body: '?id=' + player_id + cmd }).then(function (response) {
        if (response.ok) {
            //response.blob().then(function (myBlob) {
            //    var objectURL = URL.createObjectURL(myBlob);
            //    myImage.src = objectURL;
            //});
        } else {
            console.log('Network response was not ok.');
        }
    })
        .catch(function (error) {
            console.log('There has been a problem with your fetch operation: ' + error.message);
        });
};

function set_trade_mode(mode)
// switch trade mode
{
    trade_mode = mode;
    if (trade_mode) {
        show_elem(opponent_div);
        hide_elem(agree_btn);
        trade_res.innerHTML = '';
        show_elem(trade_res);
    }
    else {
        hide_elem(opponent_div);
        clear_childs(sug_div);
        clear_childs(opsug_div);
        clear_childs(trade_div);
    }
}

function add_invent_img(index, number, src, parent, eq, mx = 0)
// add image for inventory, keep number in data-number field (if mx != 0: mx - maximal availiable number)
{
    let cls = '';
    if (eq)
        cls = 'equip';
    if (mx)
        n = Math.min(number, mx);
    else
        n = number;
    let img = add_img(src, cls, parent);
    img.setAttribute('data-index', index);              // index of the item in the inventory
    img.setAttribute('data-number', n);                 // quantinty of items

    let label = add_child('samp', n, '', parent);
    label.style.left = img.left + 5;
    label.style.top = img.top + 5;

    return img;
};

function add_inv_img_from_drag(numb, div)
// low-paramers wrap around add_invent_img function for calling in enter_number window
{
    let mx = Number(drag_img.getAttribute('data-number'));
    let ind = drag_img.getAttribute('data-index');
    let src = drag_img.src;
    let img = add_invent_img(ind, numb, src, div, 0, mx);
    img.ondblclick = function () { remove_invent_img(this); };

    drag_img = null;
};

function remove_invent_img(img)
// function of deleting item from inventlist (automaticall hide agree btn)
{
    del_obj(img.nextSibling);
    del_obj(img);
    hide_elem(agree_btn);
};

function change_invent_img(diff, img)
// change quantity of inventory item on difference (diff)
{
    // for compability we need to use data from global variable drag_img
    let mx = Number(drag_img.getAttribute('data-number'));

    let cur_numb = Number(img.getAttribute('data-number'));
    let n = cur_numb + Number(diff);
    if (n > mx)
        n = mx;
    if (n > 0) {
        img.setAttribute('data-number', n);
        img.nextSibling.innerHTML = n;          // change text in near span
    }
    else // remove image and span with number:
    {
        del_obj(img.nextSibling);
        del_obj(img);
    }
    drag_img = null;
    hide_elem(agree_btn);
};

function parse_self(txt)
// parse data about yourself (dir, coords, hp...)
//  use external: x0, y0, cell_size, map_content
//  use global:     map, persons, floor_objs,....
{
    let dir = Number(txt[0]);
    let msg = txt.slice(1).split(' ');
    let x = Number(msg[0]);
    let y = Number(msg[1]);
    hp_label.innerHTML = msg[2];

    // calculate new coorinate shifts
    let dx1 = x0 - x;
    let dy1 = y0 - y;

    if ((dx != dx1) || (dy != dy1)) {
        let shx = dx - dx1;
        let shy = dy - dy1;
        shift_table_cont(shx, shy, '', map_content, map);
        shift_images(shx, shy, cell_size, persons);
        shift_images(shx, shy, cell_size, floor_objs);
        dx = dx1;
        dy = dy1;
    }

    let rect = get_cell_coord(x + dx, y + dy, map, cell_size)
    if (own_img != null)
        move_and_rot_img(own_img, rect[0], rect[1], dir);
    else
        own_img = put_img(rect[0], rect[1], dir, img_dir + 'pl' + rc + '.png', pers_map);
};

function drop_item(n, obj)
// send command to drop item by its image and number
{
    send_data('#d' + dec_to_hex(obj.getAttribute('data-index')) + ' ' + dec_to_hex(n));
};

function drop_item_click(item_img)
// send command to drop item by clicking on its image and entering number
{
    let n = Number(item_img.getAttribute('data-number'));   // number of items
    if (n == 1)
        send_data('#d' + dec_to_hex(item_img.name) + ' ' + dec_to_hex(1));
    else // otherwise we need to refine quantity of items which we want to drop
    {
        var_arg = item_img;
        enter_number(numb_input, n, drop_item);
    }
}

function add_item_list(obj, list)
// добавляет картинку по которой кликнули в list, но не больше кол-ва
{
    if (trade_mode == true)
    {
        let mx = Number(obj.getAttribute('data-number'));
        let id = obj.name;  //! maybe use 'data-index' field?
        let img_list = list.getElementsByTagName('img');       // veriy, maybe this element is already presented
        let img = null;
        for (let i = 0; i < img_list.length; i++)
            if (img_list[i].name == id)
            {
                img = img_list[i];
                break;
            }
        if (img != null)
        {
            let cur_n = Number(img.getAttribute('data-number'));
            if (cur_n < mx)
            {
                img.title = cur_n + 1;
                img.setAttribute('data-number', cur_n + 1);
            }
        }
        else
            add_invent_img(id, 1, obj.src, list);
    }
};

function send_trade(list1, list2)
// send query for the trade based on to containers with images
//  hide agree_btn
{
    let query = '#e';
    let imgs1 = list1.getElementsByTagName('img');
    let imgs2 = list2.getElementsByTagName('img');
    query += String(dec_to_hex(imgs1.length)) + ' ' + String(dec_to_hex(imgs2.length));
    for (let i = 0; i < imgs1.length; i++)
        query += '|' + dec_to_hex(Number(imgs1[i].getAttribute('data-index'))) + ' ' + dec_to_hex(Number(imgs1[i].getAttribute('data-number')));
    for (i = 0; i < imgs2.length; i++)
        query += '|' + dec_to_hex(Number(imgs2[i].getAttribute('data-index'))) + ' ' + dec_to_hex(Number(imgs2[i].getAttribute('data-number')));
    send_data(query);
    hide_elem(agree_btn);
};

function apply_inventory_img(img)
// try to use item in inventory by its index
{
    if (trade_mode == false)
    {
        let ind = dec_to_hex(img.getAttribute('data-index'));
        send_data('#u' + ind);
    }
};

function drop_inventory_img()
// drop item presented by img from inventory
{
    if ((trade_mode == false) && (drag_img != null))
    {
        let n = Number(drag_img.getAttribute('data-number'));   // number of items
        if (n == 1)
        {
            send_data('#d' + dec_to_hex(drag_img.getAttribute('data-index')) + ' 1');
        }
        else // otherwise we need to refine quantity of items which we want to drop
        {
            var_arg = drag_img;
            enter_number(numb_input, n, drop_item);
        }
    }
    drag_img = null;
};

function parse_inventory(txt, parent)
// sug_list is an object for item suggesting
//! use iterator here!
{
    // delete all old objects:
    clear_childs(parent);

    let items = txt.split('|');
    let data, ident, numb, img, src, eq;
    for (let i = 0; i < items.length - 1; i++)
    {
        if (items[i] == '')
            continue;

        data = items[i].split(' ');
        ident = data[0];
        numb = parseInt(data[1], 16);   // don't forget about 16-base
        eq = (data[2] == '1');       // equip or not
        src = img_dir + 'items/' + ident + '.png';

        img = add_invent_img(i, numb, src, parent, eq);
        img.ondblclick = function () { apply_inventory_img(this); };
        img.ondragstart = function () { drag_img = this; };
        //img.onclick = function () { add_item_list(this, sug_list); };
    }
};

function parse_suggestion(txt, div)
// parse opponent's inventory
//! use iterator
//! merge with parse_inventory
{
    // delete all old objects:
    clear_childs(div);

    let items = txt.split('|');
    let data, ident, numb, img, src, ind;
    for (let i = 0; i < items.length - 1; i++)
    {
        if (items[i] == '')
            continue;

        data = items[i].split(' ');
        ident = data[0];
        ind = parseInt(data[1], 16);
        numb = parseInt(data[2], 16);   // don't forget about 16-base
        src = img_dir + 'items/' + ident + '.png';

        img = add_invent_img(ind, numb, src, div, 0);
        img.ondblclick = function () { remove_invent_img(this); };
    }
};

function suggest_invent_img(img, parent)
// add inventory image to suggestion list (parent)
//! maybe remove img from parameters as it is drag_img?
// use drag_img
{
    let i, els, ind, numb, is_img, x;

    if ((trade_mode) && (drag_img != null))
    {
        // code are the same for our and opponent inventory, so we must to verify that we move item from true item list:
        //! придумать более общий код, чтобы запретить перетаскивание в ненужные места
        if ((img.parentNode == inv_div) && (parent != sug_div))
        {
            drag_img = null;
            return;
        }
        if ((img.parentNode == trade_div) && (parent != opsug_div))
        {
            drag_img = null;
            return;
        }

        ind = img.getAttribute('data-index');
        numb = img.getAttribute('data-number');
        els = parent.getElementsByTagName('img');
        is_img = false;
        for (i = 0; i < els.length; i++)
            if (els[i].getAttribute('data-index') == ind)
            {
                if (numb > 1)  // if we have only one item, we can't transfer it again
                {
                    x = numb - Number(els[i].getAttribute('data-number'));
                    var_arg = els[i];
                    enter_number(numb_input, x, change_invent_img);
                }
                is_img = true;
                break;
            }
        if (!is_img)
        {
            if (numb == 1)
                add_inv_img_from_drag(1, parent);
            else
            {
                var_arg = parent;
                enter_number(numb_input, numb, add_inv_img_from_drag);
            }
        }
    }
    else
        drag_img = null;
};

function parse_scream_pl(txt)
// show screams
//! use iterator
//! use map, scream_map => go to parameters
{
    let data, x, y, lang, cell, msg, rect, label;

    data = txt.split(' ');
    x = Number(data[0]);
    y = Number(data[1]);
    lang = data[2];
    msg = data[3];
    cell = find_cell(x + dx, y + dy, map);
    if (cell != null)
    {
        rect = cell.getBoundingClientRect();
        label = add_child_coord(rect.left + 5, rect.top + 5, 'samp', msg, 'lang' + lang, scream_map);
        setTimeout(del_obj, 1000, label);
    }
};

function parse_viewmap(txt)
// draw what you see
{
    let i;
    let mxX = 0, mxY = 0, mnX = 1000, mnY = 1000;
    let x, y;
    let xs = new Array();   // x-coordinates
    let ys = new Array();   // y-coordinates
    let zs = [];

    // hide old vision
    for (i = 0; i < vis_imgs.length; i++)
        vis_imgs[i].src = img_dir + 'map/fog.png';
    vis_imgs.length = 0;

    let cells = txt.split('|');
    let xyz, cell, img, visimg, elems, rect;

    // first iteration, parse answer, find min/max
    for (i = 0; i < cells.length - 1; i++)
    {
        if (cells[i] == '')
            continue;

        xyz = cells[i].split(' ');
        x = Number(xyz[0]);
        y = Number(xyz[1]);
        xs.push(x);
        ys.push(y);
        if (x > mxX)
            mxX = x;
        if (x < mnX)
            mnX = x;
        if (y > mxY)
            mxY = y;
        if (y < mnY)
            mnY = y;
        zs.push(xyz[2]);
    }

    /*
    let dx = 0, dy = 0;
    if (x0 + mxX >= map_width)
        dx = x0 + mxX - map_width + 1;
    if (x0 + mnX < 0)
        dx = x0 + mnX;
    if (y0 + mxY >= map_height)
        dy = y0 + mxY - map_height + 1;
    if (y0 + mnY < 0)
        dy = y0 + mnY;

    if ((dx != 0) || (dy != 0))
    {
        shift_table_cont(dx, dy, '', map_content, map);
        x0 -= dx;
        y0 -= dy;
        shift_images(dx, dy, cell_size, persons);
        shift_images(dx, dy, cell_size, floor_objs);
        own_img.style.left += dx * cell_size;
        own_img.style.top += dy * cell_size;
    }
    deb2.innerHTML = 'x0=' + x0 + '; y0=' + y0 + ' rect[' + mnX + ', ' + mnY + ', ' + mxX + ', ' + mxY + '] csize=' + cell_size + ' width=' + map.rows[0].cells[0].getBoundingClientRect().width;
    */

    for (i = 0; i < xs.length; i++)
    {
        x = xs[i] + dx;
        y = ys[i] + dy;
        //console.log('x=' + x + ' y=' + y + ' z=' + zs[i] + ' x0=' + x0);
        if ((x >= 0) && (x < map_width) && (y >= 0) && (y < map_height)) {
            cell = find_cell(x, y, map);
            if (cell != null)
            {
                elems = cell.getElementsByTagName('img');
                img = elems[0];
                visimg = elems[1];
                if ((zs[i] == 0) || (parseInt(zs[i], 16) > ciPerson))
                    img.src = img_dir + 'map/0.gif';
                else {
                    img.src = img_dir + 'map/' + zs[i] + '.gif';
                }
                visimg.src = img_dir + 'map/empty.png'
                vis_imgs.push(visimg);
            }
        }
    }
};

function key_press(event)
// send command to server according to pressed button
{
    if (trade_mode == false)
        switch (event.keyCode) {
            case 27:    // Esc
                send_data('#q');
                break;
            case 38: // up arrow
            case 87: // w
                send_data('#m');
                break;
            case 37: // left arrow
            case 65: // a
                send_data('#l');
                break;
            case 39: // right arrow
            case 68: // d
                send_data('#r');
                break;
            case 84:    // t letter
            case 40: // down arrow  (take)
                send_data('#t');
                break;
        }
    else
        if (event.keyCode == 27)    // stop traiding, send cmd 'cancel current action'
        {
            send_data('#!');
            set_trade_mode(false);
        }
};

async function parse_response(txt)
// server data to browser
{
    switch (txt[0])
    {
        case '0':       // skip dummy input, it's necessary for some browsers
            return;

        case 'i':       // obtain identificator
            player_id = Number(txt.slice(1));
            id_label.innerHTML = player_id;
            url = serv_addr + player_id;
            return;

        case 'k':       // obtain key
            key = txt.slice(1);
            return;

        case 'r':       // obtain cls
            rc = txt.slice(1);
            return;
    }

    debug_div.innerHTML = txt;
    let commands = txt.split('{');
    let cmd, vars;
    for (let i = 0; i < commands.length; i++)
    {
        cmd = commands[i];
        switch (cmd[0]) {
            case 'a':       // trade response
                if (cmd[1] == '0')
                    trade_res.innerHTML = 'no room!';
                else if (cmd[1] == '1')
                    trade_res.innerHTML = 'too cheap!';
                else if (cmd[1] == '3')
                    trade_res.innerHTML = 'waiting...';
                else {
                    set_trade_mode(false);
                    if (cmd[1] == '2')
                        add_child('p', 'succesfull trade!', '', log_div);
                }
                break;
            case 'b':
                if (!trade_mode)
                    set_trade_mode(true);
                parse_suggestion(cmd.slice(1), opsug_div);
                show_elem(agree_btn);
                trade_res.innerHTML = '';
                break;
            case 'e':
                if (!trade_mode)
                    set_trade_mode(true);
                parse_suggestion(cmd.slice(1), sug_div);
                break;
            case 'f':
                parse_floor(commands[i].slice(1), map, floor_map, cell_size);
                break;
            case 'i':
                parse_inventory(commands[i].slice(1), inv_div);
                break;
            case 'm':       // some standard messages
                vars = commands[i].slice(1).split(' ');
                if (vars[0] == '0') {
                    add_child('p', 'you died!', '', log_div, true);
                    fill_table_cont(map_width, map_height, '', map_content, map);
                    set_trade_mode(false);
                }
                else if (vars[0] == '1')
                    add_child('p', 'you obtained ' + parseInt(vars[1], 16) + ' damage!', '', log_div, true);
                break;
            case 'o':
                if (!trade_mode)
                    set_trade_mode(true);
                parse_suggestion(cmd.slice(1), opsug_div);
                break;
            case 'p':       // persons
                parse_persons(commands[i].slice(1), map, pers_map, cell_size);
                break;
            case 'q':
                console.log('obtain quit');
                source.close();
                alert('quit!');
                break;
            case 'r':       // scream
                parse_scream_pl(commands[i].slice(1));
                break;
            case 's':
                parse_self(commands[i].slice(1));
                break;
            case 't':       // inventory of trader
                set_trade_mode(true);
                parse_inventory(commands[i].slice(1), trade_div);
                break;
            case 'v':
                parse_viewmap(cmd.slice(1));
                break;
            default:        // log unknown directive
                //console.log('unkn=' + cmd);
                break;
        }
    }
};