// functions and variables used only for dwdung client

// general data
let player_id;// = 1;
let key = 0;
let rc = 0;

// web-data:
let url;// = serv_addr + player_id;

// client states:
let trade_mode = false;

// html-elements mandatory only for gamers client (of all types)
// player states:
let id_label = null;        // element to show player id
let hp_label = null;        // to show your hp
let state_label = null;         // current state
let inv_div = null;             // div for inventory
let own_img = null;             // image of player
let char_div = null;            // div for characteristics
let craft_div = null;           // div for craft items
let build_div = null;           // build list
let kick_div = null;            // div for superkicks
// trade:
let sug_div = null;             // div for items that you suggest to trade
let opsug_div = null;           // the same for oppoenent
let trade_div = null;             // div for inventory of trader
let trade_btn = null;            // button for trade
let trade_res = null;           // span for trade result
let agree_btn = null;           // btn for confirm trade exchange
let ask_btn = null;             // btn for ask NPC suggestion for trade exchange
let opponent_div = null;
// other:
let log_div = null;             // div for logging game events
let vis_map = null;             // <table> for visibility
// for forms and interfaces:
let numb_input = null;      // div with form for entering numbers
let drag_img = null;        // dragged image from inventory

// client data
let vis_imgs = new Array();      // (visible images) array of images, which we need empty.png -> fog.png

// some client coorinates
//let msg_x, msg_y;               // coordinates for floating message

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
};

function init_client_elems()
// define html elements mandatory for gamer clients
{
    // player states:
    id_label = document.getElementById('id_label');
    hp_label = document.getElementById('hp_label');
    state_label = document.getElementById('state_label');
    inv_div = document.getElementById('inv_div');
    log_div = document.getElementById('log_div');
    char_div = document.getElementById('char_div');
    craft_div = document.getElementById('craft_div');
    build_div = document.getElementById('build_div');
    kick_div = document.getElementById('kick_div');
    hide_elem(char_div);

    // elements for trading
    sug_div = document.getElementById('sug_div');
    opsug_div = document.getElementById('opsug_div');
    trade_div = document.getElementById('trade_div');
    opponent_div = document.getElementById('opponent_div');
    trade_btn = document.getElementById('trade_btn');
    agree_btn = document.getElementById('agree_btn');
    ask_btn = document.getElementById('ask_btn');
    trade_res = document.getElementById('trade_result');

    vis_map = document.getElementById('vis_map');

    // set some event listener
    //let elem = document.getElementById('ui_cont');
    //elem = elem.getElementsByClassName('input')[0];
    //elem.addEventListener('keydown', function (e) { e.stopPropagation(); });
};


async function send_data(cmd)
// send cmd to server
{
    ///*
    fetch(url + '&k=' + key, { method: "POST", body: '?id=' + player_id + cmd/*, mode: 'no-cors'*/ }).then(function (response) {
        if (response.ok) {
            //console.log('response:' + response);
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
    //*/

    //fetch(url + '&k=' + key, { method: "POST", body: '?id=' + player_id + cmd });

};

function set_trade_mode(mode, mobile)
// switch trade mode (use mobile=true for mobile browsers)
{
    trade_mode = mode;
    if (trade_mode) {

        if (!mobile) {
            show_elem(sug_div);
            show_elem(opsug_div);
            show_elem(trade_div);
            show_elem(trade_btn);

            hide_elem(agree_btn);
            hide_elem(ask_btn);
            trade_res.innerHTML = '';
            show_elem(trade_res);

            show_elem(opponent_div);
        }
        else
            show_elem(trade_div);

    }
    else
    {
        if (!mobile) {
            hide_elem(sug_div);
            hide_elem(opsug_div);
            hide_elem(trade_div);
            hide_elem(trade_btn);
            hide_elem(trade_res);
            hide_elem(agree_btn);

            clear_childs(sug_div);
            clear_childs(opsug_div);
            clear_childs(trade_div);

            hide_elem(opponent_div);
        }
        else
            hide_elem(trade_div);
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

    add_child('samp', n, '', parent);

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

function remove_sug_items(numb, img)
// remove some number of items form suggestion list by img and number
{
    // for compability we need to use data from global variable drag_img
    let mx = Number(img.getAttribute('data-number'));

    if (numb >= mx)     // remove all
    {
        del_obj(img.nextSibling);   // remove <samp> with number
        del_obj(img);               // remove img
    }
    else
    {
        img.setAttribute('data-number', mx - numb);
        img.nextSibling.innerHTML = mx - numb;          // change text in near span
    }
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

function drop_item(n, obj)
// send command to drop item by its image and number
{
    send_data('#d' + dec_to_hex(obj.getAttribute('data-index')) + ' ' + dec_to_hex(n));
};

function drop_item_by_index(n, ind)
// send command to drop item by its index and number
{
    send_data('#d' + dec_to_hex(ind) + ' ' + dec_to_hex(n));
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
// ��������� �������� �� ������� �������� � list, �� �� ������ ���-��
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

function send_trade(prefix, list1, list2)
// send query for the trade based on to containers with images
//  hide agree_btn
{
    let query = '#' + prefix;
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

function parse_item_lst(txt, parent, event, func)
// fill parent by <img> and <samp> with func function on event
// txt: %x %x [0/1]|%x %x [0/1] ... -> <img with attributes ><samp>numb</samp>
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

        img = add_invent_img(i, numb, src, parent, eq);     // function add image with necessary attributes and <samp> with number
        if (event)
            img.addEventListener(event, function () { func(this); });
    }
};

function parse_inventory(txt, parent, mobile=false)
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
        //img.onclick = function () { add_item_list(this, sug_list); };
        if (mobile)
        {
            img.ontouchstart = function () { mobile_invent_click(this); };
        }
        else
        {
            img.ondblclick = function () { apply_inventory_img(this); };
            img.ondragstart = function () { drag_img = this; };
        }
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

function send_img_to_itemlist(img, numb, dest, event, func)
// add item image to another list (dest), with number restriction.
// if such img already presented, the number increasen by numb
{
    let x;
    let ind = img.getAttribute('data-index');
    let avail_numb = Number(img.getAttribute('data-number'));
    let cur_numb;

    let els = dest.getElementsByTagName('img');
    for (let i = 0; i < els.length; i++)
        if (els[i].getAttribute('data-index') == ind)
        {
            cur_numb = Number(els[i].getAttribute('data-number'));
            x = Math.min(cur_numb + numb, avail_numb);
            els[i].setAttribute('data-number', x);
            els[i].nextSibling.innerHTML = x;          // change text in near <samp>

            return;
        }

    // this item was not added yet, so add it:
    x = Math.min(avail_numb, numb);
    let new_img = add_invent_img(ind, x, img.src, dest, 0, 0);
    if (event)
        new_img.addEventListener(event, function () { func(this); });
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
        //! ��������� ����� ����� ���, ����� ��������� �������������� � �������� �����
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

    data = txt.split('@');
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


// g10 -3 0|f00B01B60 10 -3 2|g6 -3 0|g11 -3 0|...  -> x, y
// function for parsing one view unit obtained from server for a player
function parse_viewcell(ind, arr, xs, ys, zs, minmaxes)
// this function will be iterated in parse_viewmap, minmaxes is array [min_x, max_x, min_y, max_y]
// use external variables:
//      for persons:    dx, dy, map, 40 (instead of csize), persons, csDead, pers_map, pers_dir
//      for floor:      dx, dy, map, 40 (instead of csize), floor_objs, floor_map, floor_dir
//      for walls:      dx, dy, wall_map, wall_dir
{
    let type = arr[0][0];
    arr[0] = arr[0].slice(1);

    // auxilary variables:
    let ident, x, y, cell, src;

    switch (type)
    {
        case 'g':   // ground
        case 'c':   // clear ground: the same as ground but without object
        case 'w':    // wall: x y look
        case 'o':   // interactive object (x y ident)
            x = Number(arr[0]);
            y = Number(arr[1]);

            //! ������ ��� ����� ���������� ������� ������ ��� g, c
            if (x < minmaxes[0])
                minmaxes[0] = x;
            else
                if (x > minmaxes[1])
                    minmaxes[1] = x;
            if (y < minmaxes[2])
                minmaxes[2] = y;
            else
                if (y > minmaxes[3])
                    minmaxes[3] = y;

            xs.push(Number(arr[0]));
            ys.push(Number(arr[1]));
            break;

        case 'p':  // person: ident x y look dir state
        case 'f':   // floor: ident x y look 
            ident = String(arr[0]);
            x = Number(arr[1]);
            y = Number(arr[2]);
            cell = get_cell_coord(x + dx, y + dy, map, 40);
            break;
    }

    switch (type)
    {
        case 'g':
            zs.push(['g', arr[2]]);       // update ground_map
            break;

        case 'c':   // clear ground: the same as ground but without object
            zs.push(['c', arr[2]]);       // update ground_map and clear map_map
            break;

        case 'o':   // interactive object (x y ident), just place at map, because it can't be send without ground ground
            zs.push(['o', arr[2], arr[3]]);       // update map_map by objs
            break;

        case 'w':    // wall x y look ground
            zs.push(['w', arr[2], arr[3]]);       // update map_map by walls
            break;

        case 'p':  // person: ident x y look dir state
            let dir = arr[4];
            let state = arr[5];
            if (persons.has(ident)) // there is this person already
            {
                upd_img(ident, cell[0], cell[1], dir, persons);
            }
            else
            {
                if (state != csDead)
                {
                    src = pers_dir + arr[3] + '.gif';
                    add_img_to_arr(ident, cell[0], cell[1], dir, src, pers_map, persons);
                }
            }
            //console.log(ident + ':' + src);
            break;

        case 'f':   // floor: ident x y look 
            if (floor_objs.has(ident)) // there is this floor obj already
            {
                upd_img(ident, cell[0], cell[1], 0, floor_objs);
            }
            else
            {
                src = floor_dir + arr[3] + '.gif';
                add_img_to_arr(ident, cell[0], cell[1], 0, src, floor_map, floor_objs);
            }
            break;
    }
}

function set_cell_img(x, y, table, src)
// auxilary function for changing src of <img> in table cell. It's assumed, that the table cell contains <img> and we change the first img in it
// and return img
{
    let cell = find_cell(x, y, table);
    if (cell != null)
    {
        let elems = cell.getElementsByTagName('img');
        elems[0].src = src;
        return elems[0];
    }
    return null;
};

function set_cell_img_rot(x, y, table, src, dir)
// the same as set_cell_img, but with rotation
{
    let cell = find_cell(x, y, table);
    if (cell != null) {
        let elems = cell.getElementsByTagName('img');
        elems[0].src = src;
        if (dir > 0) {
            let angl = String(dir * 90);
            elems[0].style.transform = 'rotate(' + angl + 'deg)';
        }
        return elems[0];
    }
    return null;
};


// value of additional shift when you are close to border of the map
const add_shift = 3;

function parse_viewmap(txt)
// draw what you see
{
    let i;
    let x, y;
    let xs = new Array();   // x-coordinates
    let ys = new Array();   // y-coordinates
    let zs = [];    /// array of array [type(g/c/o/w), ident]

    // hide old vision
    for (i = 0; i < vis_imgs.length; i++)
        vis_imgs[i].src = img_dir + 'map/fog.png';
    vis_imgs.length = 0;

    let img;

    minmaxes = [1000, -1000, 1000, -1000];
    parse_iterator('|', ' ', txt, parse_viewcell, xs, ys, zs, minmaxes);

    // remove floor, persons which we don't see anymore
    clear_images(persons);
    clear_images(floor_objs);

    // find min and max of coordinates
    let mx_x = minmaxes[1];
    let mx_y = minmaxes[3];
    let mn_x = minmaxes[0];
    let mn_y = minmaxes[2];
    let need_shift = false;
    let shx = 0, shy = 0;
    if (mx_x + dx >= map_width) {
        need_shift = true;
        shx = map_width - mx_x - 1 - dx;
        dx = map_width - mx_x - 1;
    }
    else
        if (mn_x + dx < 0)
        {
            need_shift = true;
            shx = -mn_x - dx;
            dx = -mn_x;
        }
    if (mx_y + dy >= map_height) {
        need_shift = true;
        shy = map_height - mx_y - 1 - dy;
        dy = map_height - mx_y - 1;
    }
    else
        if (mn_y + dy < 0) {
            need_shift = true;
            shy = -mn_y - dy;
            dy = -mn_y;
        }

    if (need_shift)
    {
        //let i;
        //for (i = 0; i < 3; i++)
        {
            shift_table_cont(-shx, -shy, '', map_content, map);
            shift_table_cont(-shx, -shy, '', '<img src="' + img_dir + 'map/empty.png" />', wall_map);
            shift_table_cont(-shx, -shy, '', '<img src="' + img_dir + 'map/dark.png" />', vis_map);
        }
        shift_images(shx, shy, cell_size, persons);
        shift_images(shx, shy, cell_size, floor_objs);
        own_img.style.left = shift_coord(own_img.style.left, shx * cell_size)
        own_img.style.top = shift_coord(own_img.style.top, shy * cell_size)
    }


    for (i = 0; i < xs.length; i++)
    {
        x = xs[i] + dx;
        y = ys[i] + dy;
        if ((x >= 0) && (x < map_width) && (y >= 0) && (y < map_height))
        {
            switch (zs[i][0])
            {
                case 'c':
                    // clear wall map
                    set_cell_img(x, y, wall_map, img_dir + 'map/empty.png');
                    set_cell_img(x, y, map, img_dir + 'map/' + zs[i][1] + '.gif');
                    break;

                case 'o':
                    set_cell_img(x, y, wall_map, obj_dir + zs[i][1] + '.gif');
                    set_cell_img(x, y, map, img_dir + 'map/' + zs[i][2] + '.gif');
                    break;

                case 'w':
                    set_cell_img(x, y, wall_map, wall_dir + zs[i][1] + '.gif');
                    set_cell_img(x, y, map, img_dir + 'map/' + zs[i][2] + '.gif');
                    break;
            }

            // visibility
            img = set_cell_img(x, y, vis_map, img_dir + 'map/empty.png');
            if (img != null)
                vis_imgs.push(img);
        }
    }
};

function parse_self(txt)
// parse data about yourself (dir, coords, hp...)
//  use external: cell_size, map_content
//  use global:     map, persons, floor_objs,....
{
    let dir = Number(txt[0]);
    let msg = txt.slice(1).split(' ');
    let x = Number(msg[0]);
    let y = Number(msg[1]);
    hp_label.innerHTML = msg[2];
    state_label.innerHTML = state_names[parseInt(msg[3], 16)];    // print state (don't forget about 16-base)

    let rect = get_cell_coord(x + dx, y + dy, map, cell_size)
    if (own_img != null)
        move_and_rot_img(own_img, rect[0], rect[1], dir);
    else
        own_img = put_img(rect[0], rect[1], dir, img_dir + 'pl' + rc + '.png', pers_map);
};

function key_press(event)
// send command to server according to pressed button
{
    if (trade_mode == false)
        switch (event.keyCode) {
            case 38: // up arrow
            case 87: // w
                send_data('#m');
                break;
            case 37: // left arrow
            case 65: // a
                send_data('#l');
                break;
            case 66: // b   // build command
                show_modal(build_div);
                break;
            case 67: // c
                show_elem(char_div);
                break;
            case 39: // right arrow
            case 68: // d
                send_data('#r');
                break;
            case 77: // m   // make(craft) command
                show_modal(craft_div);
                break;
            case 27:    // Esc
                send_data('#q');
                break;
            case 84:    // t letter
            case 40: // down arrow  (take)
                send_data('#t');
                break;
            case 49: // '1'
                send_data('#h1');       // hit action
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
    if (prev_time != null) {
        let new_time = new Date;
        dt_label.innerHTML = new_time - prev_time;
        prev_time = new_time;
    }
    else
        prev_time = new Date;
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
            //add_child('p', key, '', log_div, true);
            return;

        case 'r':       // obtain cls
            rc = txt.slice(1);
            return;
    }

    debug_div.innerHTML = txt;
    let commands = txt.split('{');
    let cmd, vars, img, id, val, msg;
    for (let i = 0; i < commands.length; i++)
    {
        cmd = commands[i];
        switch (cmd[0]) {
            case 'a':       // trade response
                val = '';
                switch (cmd[1]) {
                    case '0':
                        val = 'No room!';
                        hide_elem(agree_btn);
                        break;
                    case '1':
                        val = 'Too cheap!';
                        break;
                    case '3':
                        val = 'Waiting response...';
                        hide_elem(agree_btn);
                        break;
                    case '5':
                        val = 'I don\'t need this rubbish!';
                        break;
                    case '2':       // ctSuccess
                        val = 'Succesfull trade!';
                        // no break specially, to execute the next instruction
                    case '4':       // ctEscape
                        set_trade_mode(false)
                        break;
                    case '6':   // ctShowAgreeBtn
                        val = 'Do you agree with my proposal?'
                        show_elem(agree_btn);
                        break;
                    case '7':   // ctShowAskBtn
                        show_elem(ask_btn);
                        break;
                }

                if (val != '')
                {
                    trade_res.innerHTML = val;
                    add_child('p', val, '', log_div, true);
                }

                break;
            /*
            case 'b':
                if (!trade_mode)
                    set_trade_mode(true);
                parse_suggestion(cmd.slice(1), opsug_div);
                show_elem(agree_btn);
                trade_res.innerHTML = '';
                break;
             */
            case 'e':
                if (!trade_mode)
                    set_trade_mode(true);
                parse_suggestion(cmd.slice(1), sug_div);
                break;
            case 'i':
                parse_inventory(commands[i].slice(1), inv_div, mobile_mode);
                break;
            case 'k':
                clear_childs(kick_div);
                for (let j = 1; j < commands[i].length; j++)
                {
                    img = add_img(img_dir + 'kick' + commands[i][j] + '.png', '', kick_div);
                    if (mobile_mode)
                        img.ontouchstart = function () { send_data("#k" + commands[i][j]); };
                    else
                        img.onclick = function () { send_data("#k" + commands[i][j]); };
                }
                parse_inventory(commands[i].slice(1), inv_div, mobile_mode);
                break;
            case 'm':       // some standard messages
                vars = commands[i].slice(1).split(' ');
                id = parseInt(vars[0], 16);
                switch (id)
                {
                    case 0:     // you died
                        add_child('p', std_messages[id], 'logneg', log_div, true);
                        create_floating_text(std_messages[id], 150, 'fltext negat');

                        // hide screen:
                        //! probably, it's not optimal, because we need only reset <img.src>
                        //fill_table_cont(map_width, map_height, '', map_content, map);
                        //fill_table_cont(map_width, map_height, '', '<img src="' + img_dir + 'map/empty.png" />', wall_map);
                        //fill_table_cont(map_width, map_height, '', '<img src="' + img_dir + 'map/dark.png" />', vis_map);
                        fill_table_rect(vis_map, 0, 0, map_width, map_height, img_dir + 'map/dark.png');

                        set_trade_mode(false);
                        break;
                    case 1:     // obtain dmg
                        msg = std_messages[id].replace('{}', parseInt(vars[1], 16))
                        add_child('p', msg, 'logneg', log_div, true);
                        create_floating_text(msg, 150, 'fltext negat');
                        break;
                    case 2:     // skill ++
                        msg = std_messages[id].replace('{}', skill_names[parseInt(vars[1], 16)]);
                        add_child('p', msg, 'logpos', log_div, true);
                        create_floating_text(msg, 150, 'fltext posit');
                        break;
                    case 3:     // no room
                    case 4:     // no ingridents
                    case 5:     // your tool is broken
                        msg = std_messages[id];
                        add_child('p', msg, 'logneg', log_div, true);
                        create_floating_text(msg, 150, 'fltext negat');
                        break;
                    case 6:     // an item was created
                        msg = std_messages[id];
                        add_child('p', msg, 'logpos', log_div, true);
                        create_floating_text(msg, 150, 'fltext posit');
                        break;
                }
                break;
            case 'o':
                if (!trade_mode)
                    set_trade_mode(true);
                parse_suggestion(cmd.slice(1), opsug_div);
                break;
            case 'q':
                source.close();
                //alert('quit!');
                create_floating_text('you\'ve just logout', 150, 'flneg');
                add_child('p', 'you\'ve just logout', 'logneg', log_div, true);
                if (mobile_mode)
                {
                    let sp = document.getElementById('main_menu').getElementsByTagName('span')[2];
                    sp.innerHTML = 'Start';
                    sp.ontouchstart = function () { location.reload(); };

                }
                break;
            case 'r':       // scream
                if (mobile_mode)
                    parse_scream_pl_mobile(commands[i].slice(1));
                else
                    parse_scream_pl(commands[i].slice(1));
                break;
            case 's':
                if (mobile_mode)
                    parse_self_mobile(commands[i].slice(1));
                else
                    parse_self(commands[i].slice(1));
                break;
            case 't':       // inventory of trader
                console.log(commands[i].slice(1));
                set_trade_mode(true);
                if (mobile_mode)
                    parse_item_lst(commands[i].slice(1), trade_div, 'touchstart', mobile_trader_click);
                else
                    parse_inventory(commands[i].slice(1), trade_div);
                break;
            case 'v':
                if (mobile_mode)
                    parse_viewmap_mobile(cmd.slice(1));
                else
                    parse_viewmap(cmd.slice(1));
                break;
            default:        // log unknown directive
                //console.log('unkn=' + cmd);
                break;
        }
    }
};