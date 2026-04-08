import { NextRequest, NextResponse } from "next/server";

const GIGACHAT_AUTH_URL = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth";
const GIGACHAT_API_URL = "https://gigachat.devices.sberbank.ru/api/v1/chat/completions";
const GIGACHAT_AUTH_KEY = "MDE5YjUxMGEtNGVmMi03MDY1LWExZDMtMDAxMTI2YWYxOTlkOjI5ZDdkYmU5LTVjNDgtNDc0Zi1iOGVmLTBhN2Q0MzFjY2ZmZA==";
const GIGACHAT_SCOPE = "GIGACHAT_API_PERS";

// Token cache
let cachedToken: { token: string; expiresAt: number } | null = null;

function httpsFetch(url: string, options: RequestInit = {}): Promise<Response> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const https = require("https");
    const lib = parsed.protocol === "https:" ? https : require("http");

    const bodyStr = typeof options.body === "string" ? options.body : null;
    const headers: Record<string, string> = {};
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((v, k) => { headers[k] = v; });
      } else if (Array.isArray(options.headers)) {
        options.headers.forEach(([k, v]) => { headers[k] = v; });
      } else {
        Object.assign(headers, options.headers);
      }
    }

    const req = lib.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
        path: parsed.pathname + parsed.search,
        method: options.method || "GET",
        headers,
        rejectUnauthorized: false,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => {
          const body = Buffer.concat(chunks).toString();
          resolve(
            new Response(body, {
              status: res.statusCode || 200,
              headers: Object.fromEntries(
                Object.entries(res.headers).filter(([, v]) => typeof v === "string")
              ),
            })
          );
        });
        res.on("error", reject);
      }
    );

    req.on("error", reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function getAccessToken(forceNew = false): Promise<string> {
  if (!forceNew && cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const response = await httpsFetch(GIGACHAT_AUTH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${GIGACHAT_AUTH_KEY}`,
      "RqUID": crypto.randomUUID(),
      "Accept": "application/json",
    },
    body: `scope=${GIGACHAT_SCOPE}`,
  });

  if (!response.ok) {
    const text = await response.text();
    cachedToken = null; // Reset cache on failure
    throw new Error(`GigaChat auth failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  cachedToken = {
    token: data.access_token,
    // expires_at is in milliseconds from GigaChat, add 60s safety margin
    expiresAt: data.expires_at ? data.expires_at - 60000 : Date.now() + 1800000,
  };

  return cachedToken.token;
}

const PFO_CONTEXT = `Ты — экспертный ИИ-ассистент по анализу лёгкой промышленности Приволжского федерального округа (ПФО) России. Ты отвечаешь на вопросы пользователей по данным интерактивной карты.

На карте представлены 14 регионов ПФО со следующими показателями:
1. ЗАНЯТОСТЬ (2024, чел.), 2. ОТГРУЗКА 2024 и 2025 (тыс. руб.), 3. ПРОИЗВОДИТЕЛЬНОСТЬ (тыс. руб./чел.), 4. СПЕЦИАЛИЗАЦИЯ (K), 5. ПОДУШЕВОЕ ПРОИЗВОДСТВО (K).

РЕГИОНЫ:
1. Республика Башкортостан — Занятость: 14930 (11.79% ПФО), Отгрузка2024: 19055932 тыс.руб. (15.35% ПФО), Отгрузка2025: 20153937, Производительность: 1276.35 (ранг4), Kспец: 0.7749 (Средний, ранг5), Kподуш: 4.7097 (ранг5)
2. Республика Марий Эл — Занятость: 2980 (2.35%), Отгрузка2024: 2727790 (2.20%), Отгрузка2025: 2808099, Производительность: 915.37 (ранг6), Kспец: 0.6732 (Средний, ранг7), Kподуш: 4.0959 (ранг7)
3. Республика Мордовия — Занятость: 2632 (2.08%), Отгрузка2024: 924664 (0.75%), Отгрузка2025: 1035003, Производительность: 351.32 (ранг13), Kспец: 0.2003 (Низкий, ранг13), Kподуш: 1.2192 (ранг13)
4. Республика Татарстан — Занятость: 17622 (13.92%), Отгрузка2024: 13858437 (11.16%), Отгрузка2025: 16284630, Производительность: 786.43 (ранг7), Kспец: 0.5679 (Средний, ранг8), Kподуш: 3.4503 (ранг8)
5. Удмуртская Республика — Занятость: 5482 (4.33%), Отгрузка2024: 3558115 (2.87%), Отгрузка2025: 4345674, Производительность: 649.05 (ранг11), Kспец: 0.4103 (Низкий, ранг10), Kподуш: 2.4934 (ранг10)
6. Чувашская Республика — Занятость: 12056 (9.52%), Отгрузка2024: 9340997 (7.53%), Отгрузка2025: 8840459, Производительность: 774.80 (ранг8), Kспец: 1.3259 (Специализация, ранг2), Kподуш: 8.0543 (ранг2)
7. Пермский край — Занятость: 7064 (5.58%), Отгрузка2024: 15002833 (12.09%), Отгрузка2025: 17028390, Производительность: 2123.84 (ранг1), Kспец: 0.9949 (Средний, ранг4), Kподуш: 6.0445 (ранг4)
8. Кировская область — Занятость: 7721 (6.10%), Отгрузка2024: 11259585 (9.07%), Отгрузка2025: 11215736, Производительность: 1458.31 (ранг3), Kспец: 1.6543 (Специализация, ранг1), Kподуш: 10.0516 (ранг1)
9. Нижегородская область — Занятость: 14325 (11.31%), Отгрузка2024: 21617726 (17.41%), Отгрузка2025: 29811650, Производительность: 1509.09 (ранг2), Kспец: 1.171 (Специализация, ранг3), Kподуш: 7.1162 (ранг3)
10. Оренбургская область — Занятость: 7615 (6.01%), Отгрузка2024: 1431585 (1.15%), Отгрузка2025: 1364883, Производительность: 188.00 (ранг14), Kспец: 0.1295 (Низкий, ранг14), Kподуш: 0.7885 (ранг14)
11. Пензенская область — Занятость: 7343 (5.80%), Отгрузка2024: 2653431 (2.14%), Отгрузка2025: 2550382, Производительность: 361.36 (ранг12), Kспец: 0.3561 (Низкий, ранг12), Kподуш: 2.1643 (ранг12)
12. Самарская область — Занятость: 10731 (8.47%), Отгрузка2024: 7705460 (6.21%), Отгрузка2025: 7165805, Производительность: 718.06 (ранг9), Kспец: 0.4077 (Низкий, ранг11), Kподуш: 2.4785 (ранг11)
13. Саратовская область — Занятость: 10165 (8.03%), Отгрузка2024: 11087062 (8.93%), Отгрузка2025: 20411992, Производительность: 1090.71 (ранг5), Kспец: 0.7701 (Средний, ранг6), Kподуш: 4.6813 (ранг6)
14. Ульяновская область — Занятость: 5970 (4.71%), Отгрузка2024: 3912906 (3.15%), Отгрузка2025: 3955264, Производительность: 655.43 (ранг10), Kспец: 0.5529 (Средний, ранг9), Kподуш: 3.3592 (ранг9)

ПРАВИЛА: Отвечай на русском. Кратко, с цифрами. Сравнивай регионы. Не придумывай данные.`;

export async function POST(request: NextRequest) {
  try {
    const { messages, selectedRegion } = await request.json();

    const systemContent = selectedRegion
      ? PFO_CONTEXT + `\n\nВыбранный на карте регион: ${selectedRegion}.`
      : PFO_CONTEXT;

    const chatMessages = [
      { role: "system" as const, content: systemContent },
      ...messages,
    ];

    // Try first attempt
    let token = await getAccessToken();
    let response = await callGigaChat(token, chatMessages);

    // If 401, get a fresh token and retry once
    if (response.status === 401) {
      console.log("GigaChat 401 — refreshing token and retrying...");
      token = await getAccessToken(true);
      response = await callGigaChat(token, chatMessages);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("GigaChat API error:", response.status, errorText);
      return NextResponse.json(
        { error: `Ошибка GigaChat: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const assistantMessage =
      data.choices?.[0]?.message?.content || "Не удалось получить ответ";

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error("Chat API error:", error);
    const message = error instanceof Error ? error.message : "Неизвестная ошибка";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function callGigaChat(token: string, chatMessages: { role: string; content: string }[]): Promise<Response> {
  return httpsFetch(GIGACHAT_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      model: "GigaChat",
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });
}
