FROM python:3.11-slim
WORKDIR /app
ENV PIP_NO_CACHE_DIR=1
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl build-essential ffmpeg && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
# Ajuste o entrypoint conforme sua estrutura (ex.: src/main.py)
CMD ["python", "-m", "src.main"]
