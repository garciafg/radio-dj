# 🎧 Sistema Web para DJs e Web Rádios

Este projeto é um sistema completo para gerenciar DJs, programação musical, eventos e transmissões ao vivo em web rádios. Ele tem foco em temas visuais inspirados nas boates e rádios dos anos 80 e 90. DJs podem se cadastrar, publicar suas programações, divulgar eventos e interagir com a audiência via chat ao vivo e player embutido.

---

## 🚀 Tecnologias

### Backend
- Node.js com Express
- MongoDB com Mongoose
- Socket.io (tempo real)
- JWT para autenticação de administradores e DJs
- Multer (upload de imagens)
- Docker para conteinerização
- CORS habilitado

### Frontend
- React.js com Vite
- TailwindCSS com tema escuro (anos 80/90)
- ShadCN UI ou Radix UI para UI moderna e acessível
- React Router DOM
- React Player (para embed do stream de rádio)
- Axios para comunicação com o backend

---

## 📦 Estrutura do Projeto

/backend
├── controllers/
├── models/
├── routes/
├── middlewares/
├── uploads/
└── server.js

/frontend
├── src/
├── components/
├── pages/
├── layouts/
└── App.jsx

/docker
└── docker-compose.yml


---

## 🔐 Funcionalidades

### 🎙️ Área do DJ
- Cadastro e login
- Escolher até **4 estilos musicais** (lista criada no painel admin)
- Escolher **dias e horários da programação**
- Inserir **nome do programa**
- Após aprovação do admin, recebe **notificação e acesso liberado**
- Postar **banner da programação**
- Editar **foto de perfil**
- Gerenciar **agenda de eventos**
- Definir **cidade/UF**
- Visualizar **notificações do admin**
- Acessar **área de downloads** com templates de banners
- Ver status do programa (ao vivo, aprovado, pendente)

---

### 🧑‍💼 Área do Administrador
- Login
- **Aprovar cadastros** de DJs
- **Criar e editar estilos musicais**
- **Enviar mensagens/avisos para todos os DJs**
- Gerenciar **programações cadastradas**
- Criar e editar **eventos especiais**, com:
  - Nome do evento
  - Dia/Mês
  - Lista de DJs com:
    - Nome artístico
    - Foto
    - Hora de início e fim
- Ver todos os programas ativos por dia e hora

---

### 🏠 Página Inicial (Frontend Público)
- Tema escuro com visual retrô (anos 80 e 90)
- Player da rádio com transmissão de streaming
- Exibição em tempo real do programa ao vivo:
  - Nome do programa
  - Foto do DJ
  - Nome do DJ
  - Cidade/UF
- Carrossel "Nossa Equipe" com:
  - Foto do DJ
  - Nome artístico
  - Cidade/UF
- Textos institucionais sobre a rádio
- Imagens envolventes com temática boate, vinil, rádio antiga

---

### 🗓️ Eventos Especiais
- Quando houver eventos programados:
  - Exibe nome do evento
  - Data (dia/mês) e dia da semana
  - Botão "Participar"
    - Abre modal para DJ inserir:
      - Nome
      - Email
      - WhatsApp
      - Horário de apresentação (máx 1 hora)
    - Prevenção de spam com validação de horário/tempo
- Se não houver evento, oculta a seção

---

### 💬 Página de Chat
- Chat embutido via MinChat (ou outro embed)
- Lado esquerdo: chat
- Lado direito: embed do YouTube
- Mostra os **programas ao vivo**
- Destaque para o programa que está no ar agora
- Lista de próximos programas ao vivo

---

## 📦 Docker

Projeto entregue com `docker-compose.yml` com os seguintes serviços:
- `frontend` (porta 3000)
- `backend` (porta 4000)
- `mongodb` (porta 27017)
- Volumes persistentes para banco de dados e uploads

### Exemplo de docker-compose.yml

xemplo de docker-compose.yml

```yaml
services:
  backend:
    build: ./backend
    ports:
      - "4000:4000"
    volumes:
      - ./backend/uploads:/app/uploads
    depends_on:
      - mongodb
    networks:
      - app-network

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - app-network

  mongodb:
    image: mongo
    restart: always
    volumes:
      - mongo_data:/data/db
    networks:
      - app-network

volumes:
  mongo_data:

networks:
  app-network:
    driver: bridge

