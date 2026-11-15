from urllib.parse import urlparse
from flask import Flask, request, redirect, jsonify, abort, render_template
from hashids import Hashids
from config import HASHID_SALT
from db import get_conn

app = Flask(__name__, template_folder="../Front-end/template", static_folder="../Front-end/static")
funcao = Hashids(salt=HASHID_SALT, min_length=4)

def url_valida(url):
    p = urlparse(url)
    return p.scheme in ("http", "https") and bool(p.netloc) and len(url)  <= 2048

@app.get("/")
def home():
    return render_template("index.html")

@app.post("/api/encurtar")
def encurtar():
    url = (request.get_json(silent=True) or {}).get("url", "").strip()
    if url and "://" not in url:
        url = "https://" + url
    if not url_valida(url):
        return jsonify(erro="URL inválida"), 400

    conn = get_conn()

    try:
        cur= conn.cursor()
        cur.execute("INSERT INTO links (url_original) VALUES (%s)", (url,))
        conn.commit()
        codigo = funcao.encode(cur.lastrowid)
    finally:
        conn.close()

    return jsonify(codigo=codigo, url_curta=f"{request.host_url}{codigo}", url_original=url), 201

@app.get("/api/historico")
def historico():
    conn = get_conn()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute(
            "SELECT id, url_original, cliques, criado FROM links ORDER BY id DESC LIMIT 10"
        )
        linha = cur.fetchall()
    finally:
        conn.close()

    return jsonify([
        {
            "url_curta":  f"{request.host_url}{funcao.encode(l['id'])}",
            "url_original": l["url_original"],
            "cliques": l["cliques"],
            "criado": l["criado"].strftime("%d/%m/%Y [%H:%M]"),
        }
        for l in linha
    ])

@app.get("/<codigo>")
def abrir(codigo):
    decodificando = funcao.decode(codigo)
    if not decodificando:
        abort(404)

    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute("SELECT url_original FROM links WHERE id = %s", (decodificando[0],))
        row = cur.fetchone()
        if not row:
            abort(404)
        cur.execute("UPDATE links SET cliques = cliques + 1 WHERE id = %s", (decodificando[0],))
        conn.commit()
    finally:
        conn.close()

    return redirect(row[0], code=302)



if __name__ == "__main__":
    app.run(debug=True)