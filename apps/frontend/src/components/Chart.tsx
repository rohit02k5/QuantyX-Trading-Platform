"use client";
import { createChart, ColorType, IChartApi } from 'lightweight-charts';
import React, { useEffect, useRef } from 'react';
import { OrderEvent } from '../types';

// Binance uses 'kline' for candles
// Binance uses 'kline' for candles
interface ChartProps {
    symbol: string;
    interval: string;
    events?: OrderEvent[];
    onPriceUpdate?: (price: number) => void;
}

export default function Chart({ symbol, interval = '1m', events = [], onPriceUpdate }: ChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<any>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const intervalRef = useRef(interval);

    // Update ref when interval changes to avoid effect stale closures if needed
    // But we will re-run effect on interval change

    // 1. Initialize Chart
    useEffect(() => {
        if (!chartContainerRef.current) return;

        // Dispose old chart if exists (though usually we just want to update data)
        // For simplicity, let's just recreate logic or clear data. 
        // Better to destroy and recreate to ensure clean state for lightweight-charts

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: '#161A1E' },
                textColor: '#D9D9D9',
            },
            grid: {
                vertLines: { color: '#2B3139' },
                horzLines: { color: '#2B3139' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 500,
        });

        chartRef.current = chart;

        const candleSeries = chart.addCandlestickSeries({
            upColor: '#0ECB81',
            downColor: '#F6465D',
            borderVisible: false,
            wickUpColor: '#0ECB81',
            wickDownColor: '#F6465D',
        });
        seriesRef.current = candleSeries;

        // Fetch Historical Data (Mainnet for reliability)
        let isMounted = true;
        fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=1000`)
            .then(res => res.json())
            .then(data => {
                if (!isMounted) return;
                const cdata = data.map((d: any) => ({
                    time: d[0] / 1000,
                    open: parseFloat(d[1]),
                    high: parseFloat(d[2]),
                    low: parseFloat(d[3]),
                    close: parseFloat(d[4]),
                }));
                candleSeries.setData(cdata);
                // Initialize last price
                if (cdata.length > 0 && onPriceUpdate) {
                    onPriceUpdate(cdata[cdata.length - 1].close);
                }
            })
            .catch(err => console.error("Fetch error", err));

        // WebSocket for Realtime updates
        let reconnectTimeout: NodeJS.Timeout;

        const connect = () => {
            if (!isMounted) return;

            // Updated to use Mainnet URL for reliable price feed
            const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${interval}`);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('Binance WS Connected');
            };

            ws.onmessage = (event) => {
                if (!isMounted) return;
                const message = JSON.parse(event.data);
                const k = message.k;
                if (k) {
                    const close = parseFloat(k.c);
                    candleSeries.update({
                        time: k.t / 1000 as any,
                        open: parseFloat(k.o),
                        high: parseFloat(k.h),
                        low: parseFloat(k.l),
                        close: close,
                    });
                    if (onPriceUpdate) onPriceUpdate(close);
                }
            };

            ws.onerror = (err: Event) => {
                console.error('Binance WS Error:', err);
                ws.close(); // Trigger onclose
            };

            ws.onclose = () => {
                if (isMounted) {
                    console.log('Binance WS Closed. Reconnecting...');
                    reconnectTimeout = setTimeout(connect, 3000);
                }
            };
        };

        // Initial connection delay
        const initTimeout = setTimeout(connect, 300);

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            isMounted = false;
            clearTimeout(initTimeout);
            clearTimeout(reconnectTimeout);
            window.removeEventListener('resize', handleResize);
            if (wsRef.current) {
                wsRef.current.onclose = null; // Prevent reconnect on cleanup
                wsRef.current.close();
                wsRef.current = null;
            }
            chart.remove();
        };
    }, [symbol, interval]);

    // 2. Update Markers
    useEffect(() => {
        if (!seriesRef.current || !events.length) return;

        const markers = events
            .filter(e => e.status === 'FILLED' && e.symbol === symbol)
            .map(e => ({
                time: (new Date(e.timestamp).getTime() / 1000) as any,
                position: e.side === 'BUY' ? 'belowBar' : 'aboveBar',
                color: e.side === 'BUY' ? '#0ECB81' : '#F6465D',
                shape: e.side === 'BUY' ? 'arrowUp' : 'arrowDown',
                text: `${e.side} @ ${e.price}`,
            }));

        markers.sort((a: any, b: any) => a.time - b.time);

        seriesRef.current.setMarkers(markers);
    }, [events, symbol]);

    return (
        <div className="w-full h-[500px] bg-[#161A1E] relative" ref={chartContainerRef} />
    );
}
