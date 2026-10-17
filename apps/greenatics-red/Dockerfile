FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    APP_ENV=production \
    PORT=10000

WORKDIR /app
COPY requirements.txt ./
RUN python -m pip install --upgrade pip && python -m pip install -r requirements.txt
COPY . .
RUN chmod +x start.sh \
    && mkdir -p /app/instance /var/data/red/private/evidence \
    && chown -R 10001:10001 /app/instance /var/data/red/private
EXPOSE 10000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:10000/api/health', timeout=3)" || exit 1
USER 10001:10001
CMD ["./start.sh"]
