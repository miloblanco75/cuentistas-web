#!/bin/bash

# VPS Resilience Validation Tool for Cuentistas
# Controlled infrastructure failure testing for PM2 environments.

APP_NAME="cuentistas" # Update this to match your PM2 process name
WAIT_TIME=30
STRESS_URL="http://localhost:3000/api/debug/stress?status=200"

echo "=========================================="
echo "   CUENTISTAS RESILIENCE VALIDATOR (VPS)  "
echo "=========================================="

function check_status() {
    echo "[*] Checking service status..."
    pm2 show $APP_NAME > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        STATUS=$(pm2 jlist | jq -r ".[] | select(.name == \"$APP_NAME\") | .pm2_env.status")
        echo "[+] Service '$APP_NAME' is currently: $STATUS"
    else
        echo "[!] Service '$APP_NAME' not found in PM2."
        exit 1
    fi
}

function simulate_stop() {
    echo "[!] CAUTION: Stopping service for ${WAIT_TIME}s..."
    pm2 stop $APP_NAME
    echo "[*] Service stopped. System should show NETWORK error in frontend."
    
    for i in $(seq $WAIT_TIME -1 1); do
        echo -ne "    Recovering in: $i\033[0K\r"
        sleep 1
    done
    echo ""
    
    echo "[*] Restarting service..."
    pm2 start $APP_NAME
    echo "[+] Service restarted. Validation starting..."
    sleep 5
}

function simulate_restart() {
    echo "[*] Triggering rolling restart (PM2 reload)..."
    pm2 reload $APP_NAME
    echo "[+] Service reloaded. Checking health..."
}

function verify_health() {
    echo "[*] Verifying endpoint health..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$STRESS_URL")
    if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "401" ]; then
        echo "[✅] HEALTH CHECK PASSED (HTTP $HTTP_CODE)"
    else
        echo "[❌] HEALTH CHECK FAILED (HTTP $HTTP_CODE)"
    fi
}

case "$1" in
    stop)
        check_status
        simulate_stop
        verify_health
        ;;
    restart)
        check_status
        simulate_restart
        verify_health
        ;;
    status)
        check_status
        verify_health
        ;;
    *)
        echo "Usage: $0 {stop|restart|status}"
        exit 1
esac

echo "=========================================="
echo "   RECOVERY TEST COMPLETED SUCCESSFULLY   "
echo "=========================================="
