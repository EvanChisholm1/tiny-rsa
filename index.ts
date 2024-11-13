type Row = { x: number; y: number; r: number; q: number };

type Certificate = { d: number; s: number; t: number };

const eeaRecurse = (rows: Row[]): Certificate => {
    const i = rows.length;
    const q = Math.floor(rows[i - 2].r / rows[i - 1].r);

    const x = rows[i - 2].x - q * rows[i - 1].x;
    const y = rows[i - 2].y - q * rows[i - 1].y;
    const r = rows[i - 2].r - q * rows[i - 1].r;

    if (r === 0) {
        return {
            d: rows[i - 1].r,
            s: rows[i - 1].x,
            t: rows[i - 1].y,
        };
    }

    return eeaRecurse([...rows, { x, y, r, q }]);
};

const eea = (a: number, b: number): Certificate => {
    return eeaRecurse([
        { x: 1, y: 0, r: Math.max(a, b), q: 0 },
        { x: 0, y: 1, r: Math.min(a, b), q: 0 },
    ]);
};

const primeSieve = (size: number): boolean[] => {
    const chart = new Array(size + 1).fill(true);

    chart[0] = false;
    chart[1] = false;
    for (let i = 2; i <= size; i++) {
        if (!chart[i]) continue;
        for (let k = i + i; k <= size; k += i) {
            chart[k] = false;
        }
    }

    return chart;
};

const getPrimes = (ceiling: number): number[] => {
    const chart = primeSieve(ceiling);
    const primes = chart.map((x, i) => (x ? i : x)).filter((x) => x);
    return primes as number[];
};

const getRandomFromList = <T>(list: Array<T>): T => {
    const i = Math.floor(Math.random() * list.length);
    return list[i];
};

const isCoprime = (a: number, b: number): boolean => {
    const { d } = eea(a, b);
    // by coprimeness characterization theorem or whatever
    return d === 1;
};

const selectQ = (primes: number[], p: number): number => {
    const q = getRandomFromList(primes);
    return q === p ? selectQ(primes, p) : q;
};

const selectPQ = (primes: number[]): { p: number; q: number } => {
    const p = getRandomFromList(primes);
    const q = selectQ(primes, p);
    return { p, q };
};

const selecte = (p: number, q: number): number => {
    const potential_e = [];
    for (let e = 2; e < (p - 1) * (q - 1); e++) {
        if (isCoprime(e, (p - 1) * (q - 1))) potential_e.push(e);
    }

    return getRandomFromList(potential_e);
};

const findD = (e: number, p: number, q: number): number => {
    let d = 1;
    while ((e * d) % ((p - 1) * (q - 1)) !== 1) {
        d++;
    }

    return d;
};

console.log(getPrimes(30));

type PublicKey = { e: number; n: number };
type PrivateKey = { d: number; n: number };

function setupRSARandom() {
    const primes = getPrimes(20).splice(4);
    console.log(primes);
    const { p, q } = selectPQ(primes);
    const e = selecte(p, q);
    console.log(p, q, e);
    return setupRSA(p, q, e);
}

function setupRSA(
    p: number,
    q: number,
    e: number
): { pub: PublicKey; pri: PrivateKey } {
    const n = p * q;

    const pub: PublicKey = { e, n };
    const d = findD(e, p, q);
    const pri: PrivateKey = { d, n };
    return { pub, pri };
}

console.log(setupRSA(2, 11, 3));

console.log(setupRSARandom());
