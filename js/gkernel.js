// universal game functions and variables

// dependeces, use external:
// dx, dy - coordinates shift
// pers_dir - directory with persons images
// floor_dir - directory with floor objects images

// Global variables:


let source;     // for SSE: event source

let persons = new Map();      // associative array, where key is person unical identifier and value is corresponding image object
// persons[ident] = (obtained: boolean, image: <img>)
let floor_objs = new Map();     // the same for floor objects

// some consts:
const ciPerson = 1000;
const csDead = 700;


// shift images in associative array (Map) of given format (like variables persons and floor_objs)
function shift_images(dx, dy, csize, arr)
{
    for (let pair of arr.entries())
    {
        pair[1][1].style.left += dx * csize;
        pair[1][1].style.top += dy * csize;
    }
}

// clear non-actual images in associative arrays like persons or floor_objes (values keep array[obtained now, image])
function clear_images(arr)
{
    for (let pair of arr.entries())     // pair is [key, value] value = [obtained, image]
    {
        if (pair[1][0] == false)
        {
            del_obj(pair[1][1]);
            arr.delete(pair[0]);
        }
        else
            pair[1][0] = false;
    }
}


// place img on document at coordinates (x,y) and save direction (orientation) in a special field
// dir = direction = (0,1,2,3) * pi/2
// return address of image
function put_img(x, y, dir, src, parent)
{
    let img = document.createElement('img');
    img.setAttribute('data-dir', dir);
    img.src = src;
    img.style.left = x;
    img.style.top = y;
    img.style.position = 'absolute';
    if (dir > 0)
    {
        let angl = String(dir * 90);
        img.style.transform = 'rotate(' + angl + 'deg)';
    }
    parent.appendChild(img);
    return img;
};

// перемещает и поворачивает (при необходимости) картинку
function move_and_rot_img(img, x, y, dir)
{
    let old_dir = img.getAttribute('data-dir');
    img.style.left = x;
    img.style.top = y;

    if (dir != old_dir) {
        img.setAttribute('data-dir', dir);
        if (1/*dir != 0*/) {
            img.setAttribute('data-dir', dir);
            let angl = String(dir * 90);
            img.style.transform = 'rotate(' + angl + 'deg)';
        }
    }
}

function get_cell_coord(x, y, cell_map, cell_sz)
// get pixel coordinates of the cell, even if it is out of border
{
    let res = [0, 0];
    let rect = cell_map.rows[0].cells[0].getBoundingClientRect();
    res[0] = rect.left + x * cell_sz;
    res[1] = rect.top + y * cell_sz;
    return res;
}


function add_img_to_arr(id, x, y, dir, src, div, arr)
// add image(src=src) to associative array like persons or floor_objs
// place image in div
// id - idenfier, arr - associative array (Map)
// x, y, dir - x, y and direction
{
    let img = put_img(x, y, dir, src, div);
    img.alt = id;
    img.title = id;
    arr.set(id, [true, img]);
};


function upd_img(id, x, y, dir, arr)
// update image in associative array like persons or floor_objs
// id - idenfier, arr - associative array (Map)
// x, y, dir - new x, y and direction
{
    arr.get(id)[0] = true;
    let img = arr.get(id)[1];
    move_and_rot_img(img, x, y, dir);
};


function parse_persons(txt, cell_map, pers_map, csize)
{

    let pers = txt.split('|');
    let data, ident, x, y, cell, look, dir, src, state;
    for (let i = 0; i < pers.length - 1; i++)
    {
        if (pers[i] == '')
            continue;

        data = pers[i].split(' ');
        ident = String(data[0]);
        x = Number(data[1]);
        y = Number(data[2]);
        look = data[3];
        dir = data[4];
        state = data[5];
        cell = get_cell_coord(x + dx, y + dy, cell_map, csize);
        if (persons.has(ident)) // there is this person already
        {
            upd_img(ident, cell[0], cell[1], dir, persons);
        }
        else {
            if (state != csDead)
            {
                src = pers_dir + look + '.png';
                add_img_to_arr(ident, cell[0], cell[1], dir, src, pers_map, persons);
            }
        }
    }

    clear_images(persons);
};


function parse_floor(txt, cell_map, fl_map, csize)
{
    let floor = txt.split('|');
    let data, ident, x, y, cell, look, src;
    for (let i = 0; i < floor.length - 1; i++)
    {
        if (floor[i] == '')
            continue;

        data = floor[i].split(' ');
        ident = String(data[0]);
        x = Number(data[1]);
        y = Number(data[2]);
        look = data[3];
        cell = get_cell_coord(x + dx, y + dy, cell_map, csize);

        if (floor_objs.has(ident)) // there is this floor obj already
        {
            upd_img(ident, cell[0], cell[1], 0, floor_objs);
        }
        else
        {
            src = floor_dir + look + '.png';
            add_img_to_arr(ident, cell[0], cell[1], 0, src, fl_map, floor_objs);
        }
    }

    // remove that we don't see
    clear_images(floor_objs);
};