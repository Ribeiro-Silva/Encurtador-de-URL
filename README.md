# 🔗 Encurtador de URL

Aplicação web que transforma links longos em códigos curtos (ex.: `http://127.0.0.1:5000/aB3x`), redireciona quem acessa o link curto e guarda o histórico de links e de cliques em um banco MySQL.

Projeto de estudo desenvolvido para praticar back-end com Python, banco de dados relacional e integração com um front-end simples.

<!-- Adicione aqui um print ou GIF do projeto funcionando, por exemplo: ![Demonstração](docs/demo.gif) -->

## Funcionalidades

- Encurtar uma URL e exibir o resultado em um popup, com botão para copiar
- Redirecionamento do link curto para a URL original
- Contador de cliques por link
- Histórico dos últimos 10 links, exibido em tabela e atualizado após cada encurtamento
- Validação da URL no servidor (aceita apenas `http` e `https`)

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Back-end | Python 3, Flask |
| Geração do código | [Hashids](https://hashids.org/python/) (alfabeto base 62) |
| Banco de dados | MySQL 8 (`mysql-connector-python`) |
| Front-end | HTML5, JavaScript (Fetch API) |
| Estilo | Tailwind CSS v4 |
| Configuração | `python-dotenv` (variáveis de ambiente) |

## Como funciona

1. O front-end envia a URL para `POST /api/encurtar`.
2. O servidor valida a URL e a grava na tabela `links`. O MySQL gera um `id` numérico (`AUTO_INCREMENT`).
3. O Hashids converte esse `id` em um código curto e não sequencial (ex.: `7` vira `aB3x`).
4. Ao acessar `GET /<codigo>`, o servidor converte o código de volta em `id`, busca a URL original, incrementa o contador de cliques e responde com um redirecionamento `302`.

O código não é guardado no banco: ele é recalculado a partir do `id` e do `salt` secreto.

## Estrutura do projeto

```
encurtador-de-url/
├── Back-end/
│   ├── app.py            # rotas Flask
│   ├── config.py         # leitura das variáveis de ambiente
│   ├── db.py             # conexão com o MySQL
│   ├── schema.sql        # criação do banco, da tabela e do usuário
│   └── .env.example      # modelo das variáveis de ambiente
├── Front-end/
│   ├── template/
│   │   └── index.html
│   └── static/
│       ├── css/          # input.css (fonte) e output.css (gerado pelo Tailwind)
│       └── js/main.js
├── package.json
├── requirements.txt
└── README.md
```

## Pré-requisitos

- Python 3.10 ou superior
- MySQL Server 8 ou superior
- Node.js (opcional, só para alterar os estilos com o Tailwind)

## Como rodar localmente

**1. Clone o repositório**

```bash
git clone https://github.com/SEU-USUARIO/encurtador-de-url.git
cd encurtador-de-url
```

**2. Crie o ambiente virtual e instale as dependências**

```bash
python -m venv venv

# Windows (PowerShell)
venv\Scripts\Activate.ps1
# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
```

**3. Crie o banco de dados**

Abra o `Back-end/schema.sql` e troque `TROQUE_ESTA_SENHA` por uma senha sua. Depois execute o script com um usuário administrador do MySQL (como o `root`):

```bash
# Linux/macOS, CMD ou Git Bash
mysql -u root -p < Back-end/schema.sql

# PowerShell (o operador < não funciona)
mysql -u root -p -e "source Back-end/schema.sql"
```

Se o seu MySQL não usa a porta padrão (3306), acrescente `-P NUMERO_DA_PORTA`. Também é possível abrir o `schema.sql` no MySQL Workbench e executá-lo.

**4. Configure as variáveis de ambiente**

Copie o modelo e preencha com os seus dados:

```bash
cp Back-end/.env.example Back-end/.env
```

| Variável | Descrição |
|---|---|
| `DB_HOST` | Endereço do MySQL (padrão `localhost`) |
| `DB_PORT` | Porta do MySQL (padrão `3306`) |
| `DB_USER` | Usuário criado no `schema.sql` |
| `DB_PASSWORD` | Senha definida no `schema.sql` |
| `DB_NAME` | Nome do banco (`encurtador`) |
| `HASHID_SALT` | Frase secreta que embaralha os códigos |

O arquivo `.env` guarda segredos e **não é versionado**. Mantenha o `HASHID_SALT` fixo: se ele mudar, os links já criados deixam de funcionar.

**5. Inicie o servidor**

```bash
cd Back-end
python app.py
```

Abra `http://127.0.0.1:5000` no navegador.

## Alterando os estilos (opcional)

O CSS gerado (`output.css`) já acompanha o repositório, então o projeto roda sem Node.js. Para editar as classes do Tailwind, na raiz do projeto:

```bash
npm install
npm run dev:css     # recompila automaticamente ao salvar
npm run build:css   # versão minificada
```

## API

| Método | Rota | Descrição | Respostas |
|---|---|---|---|
| `GET` | `/` | Página principal | `200` |
| `POST` | `/api/encurtar` | Recebe `{"url": "..."}` e devolve `codigo`, `url_curta` e `url_original` | `201`, `400` (URL inválida) |
| `GET` | `/api/historico` | Últimos 10 links, com cliques e data de criação | `200` |
| `GET` | `/<codigo>` | Redireciona para a URL original e conta o clique | `302`, `404` |

Exemplo:

```bash
curl -X POST http://127.0.0.1:5000/api/encurtar \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com"}'
```

## Boas práticas aplicadas

- Consultas SQL parametrizadas (`%s`), contra SQL injection
- Validação do esquema da URL (`http`/`https`), contra redirecionamentos como `javascript:`
- Dados do banco inseridos na página com `textContent`, contra XSS
- Segredos fora do código, em variáveis de ambiente
- Usuário do banco com privilégios mínimos (`SELECT`, `INSERT`, `UPDATE`)
- Contador de cliques incrementado no próprio SQL (`cliques = cliques + 1`), sem perda em acessos simultâneos

## Limitações e próximos passos

- O servidor roda em modo `debug`, adequado só para desenvolvimento. Em produção, usar `gunicorn` com o debug desligado.
- O histórico é global (não há login de usuários).
- Ainda não há limite de requisições por IP.
- O Hashids ofusca os IDs, mas não é criptografia: não serve para proteger links privados.
- Ideias: deploy online, links com alias personalizado, expiração de links, painel de estatísticas por link, testes automatizados.

## Autor

Matheus Ribeiro Silva

[LinkedIn](COLE-AQUI-O-LINK-DO-SEU-LINKEDIN) · [GitHub](https://github.com/SEU-USUARIO)
