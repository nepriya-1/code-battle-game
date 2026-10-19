//ФУНКЦИЯ ПРОВЕРКИ JAVASCRIPT
// Выполняет код игрока и возвращает результат console.log
function runAndGetOutput(code) {
    let output = '';
    // Создаем console.log который записывает текст в переменную output
    const sandboxConsole = {
        log: function() {
            let str = '';
            for (let i = 0; i < arguments.length; i++) {
                str = str + String(arguments[i]);
            }
            output = output + str;
        }
    };
    
    try {
        // Выполняем код игрока, передавая ему наш console
        const func = new Function('console', code);
        func(sandboxConsole);
    } catch (error) {
        return null; // Если ошибка — возвращаем null
    }
    
    return output;  // Возвращаем то, что игрок вывел в консоль
}


//ПРОВЕРКА PYTHON ЧЕРЕЗ PYODIDE
async function runPythonCode(code) {
    // Если Pyodide ещё не загружен — загружаем
    if (typeof loadPyodide === 'undefined') {
        return null;
    }

    try {
        const pyodide = await loadPyodide();
        
        // Перехватываем print
        pyodide.runPython(`
import sys
import io
sys.stdout = io.StringIO()
        `);

        // Выполняем код игрока
        await pyodide.runPythonAsync(code);

        // Получаем вывод
        const output = pyodide.runPython("sys.stdout.getvalue()");
        
        // Возвращаем всё как было
        pyodide.runPython("sys.stdout = sys.__stdout__");

        return output.trim();
    } catch (error) {
        console.error("Ошибка Python:", error);
        return null;
    }
}



// === МАССИВ ЗАДАЧ ===
const TASKS = [
    {
        id: 1,
        language: 'js',
        title: 'Задача 7: Чётное число',
        description: 'Дано число x = 8.\nНапишите код, который выведет "да", если число чётное, и "нет" — если нечётное.\nПодсказка: используйте if (x % 2 === 0)',
        check: (code) => {
        const result = runAndGetOutput(code);
        return result !== null && result.toLowerCase().includes('да');
        }
    },
    /*
    let x = 8;
    if (x % 2 === 0) {
    console.log("да");
    } else {
    console.log("нет");
    }
    */
    {
        id: 2,
        language: 'js',
        title: 'Задача 1: Сумма',
        description: 'Напишите код, который выведет сумму чисел 2 и 3.\nПодсказка: console.log(2 + 3);',
        check: (code) => {
            return runAndGetOutput(code) === '5';
        }
    },

    /*
    console.log(2 + 3);

    ИЛИ

    let a = 2;
    let b = 3;
    console.log(a + b);
    */
    {
        id: 3,
        language: 'js',
        title: 'Задача 2: Приветствие',
        description: 'Напишите код, который выведет слово "Hello".\nПодсказка: console.log("Hello");',
        check: (code) => {
            const result = runAndGetOutput(code);
            return result !== null && result.toLowerCase().includes('hello');
        }
    },

    /*
    console.log("Hello");
    */

    {
        id: 4,
        language: 'js',
        title: 'Задача 3: Умножение',
        description: 'Напишите код, который выведет произведение 6 и 7.\nПодсказка: console.log(6 * 7);',
        check: (code) => {
            return runAndGetOutput(code) === '42';
        }
    },

    /*
    console.log(6 * 7);

    ИЛИ

    let a = 6;
    let b = 7;
    console.log(a * b);
    */

    {
        id: 5,
        language: 'js',
        title: 'Задача 6: Периметр прямоугольного треугольника',
        description: 'Даны катеты прямоугольного треугольника: a = 3, b = 4.\nВычислите периметр.\nФормула: P = a + b + √(a² + b²)\nПодсказка: Math.sqrt(a*a + b*b)',
        check: (code) => {
            const result = runAndGetOutput(code);
            if (result !== '12') return false;
            return code.includes('Math.sqrt');
        }
    },

    /*
    let a = 3;
    let b = 4;
    let c = Math.sqrt(a * a + b * b);
    console.log(a + b + c);

    ИЛИ

    console.log(3 + 4 + Math.sqrt(3 * 3 + 4 * 4));
    */

    {
    id: 8,
    language: 'js',
        title: 'Задача 8: Максимум',
        description: 'Даны числа a = 5, b = 12.\nНапишите код, который выведет большее из них.\nПодсказка: используйте if (a > b)',
        check: (code) => {
            const result = runAndGetOutput(code);
            return result === '12';
        }
    },

    /*
    let a = 5;
    let b = 12;
    if (a > b) {
    console.log(a);
    } else {
    console.log(b);
    }
    */


    // === ЗАДАЧИ ДЛЯ C ===
    {
    id: 10,
    language: 'c',
    title: 'Задача C: Сумма',
    description: 'Напишите код на C, который выведет сумму чисел 2 и 3.\nПодсказка: printf("%d", 2 + 3);',
    check: (code) => {
        const clean = code.replace(/\s/g, '');
        // Требуем printf и результат 5 или 2+3
        return clean.includes('printf') && (clean.includes('5') || clean.includes('2+3'));
    }
    },

    /*
    printf("%d", 2 + 3);

    ИЛИ

    #include <stdio.h>
    int main() {
    printf("%d", 2 + 3);
    return 0;
    }
    */

    // === ЗАДАЧИ ДЛЯ PYTHON ===
    {
    id: 20,
    language: 'python',
    title: 'Задача Python: Сумма',
    description: 'Напишите код на Python, который выведет сумму чисел 2 и 3.\nПодсказка: print(2 + 3)',
    check: async (code) => {
        const result = await runPythonCode(code);
        return result === '5';
    }

    //print(2 + 3)
}
];