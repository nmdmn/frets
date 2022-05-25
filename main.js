document.addEventListener("DOMContentLoaded", function(event) {
    let cDrop = new Tune();
    cDrop.setString(1, "C");
    cDrop.setString(2, "G");
    cDrop.setString(3, "C");
    cDrop.setString(4, "F");
    cDrop.setString(5, "A");
    cDrop.setString(6, "D");

    let asDrop = new Tune();
    asDrop.setString(1, "A#/Bb");
    asDrop.setString(2, "F");
    asDrop.setString(3, "A#/Bb");
    asDrop.setString(4, "D#/Eb");
    asDrop.setString(5, "G");
    asDrop.setString(6, "C");

    let eStandart = new Tune();
    eStandart.setString(1, "E");
    eStandart.setString(2, "A");
    eStandart.setString(3, "D");
    eStandart.setString(4, "G");
    eStandart.setString(5, "B");
    eStandart.setString(6, "E");

    let gsDrop7 = new Tune();
    gsDrop7.setString(1, "G#/Ab");
    gsDrop7.setString(2, "D#/Eb");
    gsDrop7.setString(3, "G#/Ab");
    gsDrop7.setString(4, "C#/Db");
    gsDrop7.setString(5, "F#/Gb");
    gsDrop7.setString(6, "A#/Bb");
    gsDrop7.setString(7, "D#/Eb");

    let key = "G#/Ab"
    let chromatic = new Scale(key, "1 2 3 4 5 6 7");
    let majorPentatonic = new Scale(key, "1 2 3 5 6");
    let naturalMinor = new Scale(key, "1 2 b3 4 5 b6 b7");
    let harmonicMinor = new Scale(key, "1 2 b3 4 5 b6 7");

    let neck = new Neck(24, 7, gsDrop7);
    neck.filter(naturalMinor);
    neck.drawTable("neck");
});

class Fret {
    constructor(note, interval) {
        this.note = note;
        this.interval = interval;
    }

    mix(color1, color2, weight) {
        function d2h(d) { return d.toString(16); }

        function h2d(h) { return parseInt(h, 16); }

        var color = "#";
        for (var i = 0; i <= 5; i += 2) {
            var v1 = h2d(color1.substr(i, 2)),
                v2 = h2d(color2.substr(i, 2)),
                val = d2h(Math.floor(v2 + (v1 - v2) * weight));
            while (val.length < 2) { val = '0' + val; }
            color += val;
        }
        return color;
    }

    drawBound(cell) {
        let table = document.createElement("table");
        let upper = table.insertRow();
        let upperCenter = upper.insertCell();
        upperCenter.colSpan = 2;
        upperCenter.classList.add("noteCell");
        upperCenter.innerHTML = this.note;
        let lower = table.insertRow();
        let lowerLeft = lower.insertCell();
        lowerLeft.classList.add("idunnoCell");
        let lowerRight = lower.insertCell();
        lowerRight.classList.add("intervalCell");
        lowerRight.innerHTML = 0 != this.interval ? this.interval : "";
        cell.style.opacity = 0 != this.interval ? 1 : 0.25;
        cell.style.backgroundColor = 0 != this.interval ? this.mix("2980b9", "e74c3c", this.interval / 7) : "#ffffff";
        cell.style.color = 0 != this.interval ? "#ffffff" : "#000000";
        cell.appendChild(table);
    }
}

class Neck {
    constructor(frets, strings, tuning) {
        this.createGrid(frets, strings, tuning);
    }

    createGrid(frets, strings, tuning) {
        this.grid = [];
        for (let fret = 0; fret < frets + 1; fret++) {
            this.grid[fret] = [];
            for (let string = 0; string < strings; string++) {
                this.grid[fret][string] = new Fret(tuning.getNote(string, fret), 0);
            }
        }
    }

    drawTable(divId) {
        let div = document.getElementById(divId);
        let table = document.createElement("table");
        const frets = this.getFrets();
        const strings = this.getStrings();

        for (let fret = 0; fret < frets; fret++) {
            let row = table.insertRow();
            for (let string = 0; string < strings + 1; string++) {
                if (0 == string) {
                    let cell = row.insertCell();
                    cell.appendChild(document.createTextNode(fret == 0 ? "-" : fret));
                } else {
                    let cell = row.insertCell();
                    cell.classList.add("fret");
                    let bound = this.grid[fret][string - 1];
                    bound.drawBound(cell);
                }
            }
        }
        div.appendChild(table);
    }

    filter(scale) {
        for (let fret = 0; fret < this.getFrets(); fret++) {
            for (let string = 0; string < this.getStrings(); string++) {
                let bound = this.grid[fret][string];
                let interval = scale.notes.findIndex(element => bound.note == element);
                bound.interval = -1 != interval ? scale.indices[interval] : 0
            }
        }
    }

    getFrets() { return this.grid.length; }
    getStrings() { return this.grid[0].length; }
}

class Tune {
    constructor() {
        this.chromatic = new Chromatic("C");
        this.strings = [];
    }

    setString(string, note) {
        this.strings[string - 1] = note;
    }

    getNote(string, fret) {
        this.chromatic.setRoot(this.strings[string]);
        return this.chromatic.getNote(fret);
    }
}

class Chromatic {
    constructor(root) {
        this.scale = ["A",
            "A#/Bb",
            "B",
            "C",
            "C#/Db",
            "D",
            "D#/Eb",
            "E",
            "F",
            "F#/Gb",
            "G",
            "G#/Ab"
        ];
        this.setRoot(root);
    }

    setRoot(note) {
        this.root = this.scale.findIndex(root => root == note);
    }

    getNote(ix) {
        return this.scale[(this.root + ix) % 12];
    }
}

class Scale {
    constructor(root, intervals) {
        this.root = root;
        this.intervals = intervals.split(" ");
        this.indices = [];
        this.chromatic = new Chromatic(root);
        this.positions = [11, 0, 2, 4, 5, 7, 9, 11, 0]; // GE GE EASY
        this.notes = [];
        this.intervals.forEach(element => {
            const flat = "b";
            const sharp = "#";
            if (element.includes(flat)) {
                let interval = element.replace(flat, "");
                this.notes.push(this.chromatic.getNote(this.positions[interval] - 1));
                this.indices.push(interval);
            } else if (element.includes(sharp)) {
                let interval = element.replace(sharp, "");
                this.notes.push(this.chromatic.getNote(this.positions[interval] + 1));
                this.indices.push(interval);
            } else {
                this.notes.push(this.chromatic.getNote(this.positions[element]));
                this.indices.push(element);
            }
        });
        //console.log(this.notes.toString());
    }
}