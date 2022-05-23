// ..............................
// Find Pairs Of Players Solution
// ..............................

function* findPairsOfPlayers(players, sum) {
    let set = {}, noMatchesFound = true, operations = 0;

    for (let i = 0; i < players.length; ++i) {
        let temp = sum - players[i].h_in;
        operations++;

        playerConsulted(i) // UI representation
        showOperations(operations) // UI representation

        if (set[temp]) {
            noMatchesFound = false

            for (let j = 0; j < set[temp].length; j++) {
                operations++; // UI representation

                addResults(set[temp][j], players[i])
                addClasses(set[temp][j].index, i) // UI representation
                showOperations(operations) // UI representation

                yield

                removeClasses(set[temp][j].index, i) // UI representation
            }
        }
        if (!set[players[i].h_in]) set[players[i].h_in] = []

        set[players[i].h_in].push({ ...players[i], index: i })
    }
    if (noMatchesFound) showNoMatchesFoundMessage()
    showOperations(operations) // UI representation
    disable(["#start-animation", '#sum-of-heights', '#next-button', "#forward-button"]) // UI representation
}

// ..............................
// UI Representation
// ..............................

const API = 'https://mach-eight.uc.r.appspot.com/'
let animationMS = 1000

// Players Data Format
// {
//     first_name,
//     h_in,
//     h_meters,
//     last_name
// }

const getData = async () => {
    response = await fetch(API)
    return response.json()
}

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const addClasses = (player1, player2) => {
    $(`.player-${player1}`).addClass('selected')
    $(`.player-${player2}`).addClass('selected')
}

const removeClasses = (player1, player2) => {
    $(`.player-${player1}`).removeClass('selected')
    $(`.player-${player2}`).removeClass('selected')
}

const playerConsulted = (index) => {
    $(`.player-${index}`).addClass('consulted')
}

const toggle = (arrayIds, disabled) => {
    arrayIds.forEach(element => {
        $(element).attr("disabled", disabled);
    })
}

const showNoMatchesFoundMessage = () => {
    $('#no-matches').removeClass('disabled')
    console.log("No matches found")
}

const showOperations = (operations) => {
    $('#operations').text(`(${operations}) Iterations`)
    $('#operations').removeClass('disabled')
}

const enable = (arrayIds) => {
    toggle(arrayIds, false)
}

const disable = (arrayIds) => {
    toggle(arrayIds, true)
}

const startAnimation = async (generator) => {
    let value;

    do {
        value = generator.next()
        await sleep(animationMS)
    } while (!value.done)
}

const validateInput = () => {
    let value = $('#sum-of-heights').val()

    if (!value) {
        alert('A sum is required')
        throw new Error('No Sum Value')
    }
}

const addResults = (p1, p2) => {
    console.log(`- ${p1.first_name} ${p1.last_name}         ${p2.first_name} ${p2.last_name}`);

    $('.results-container').append(`
    <div class="col-2 ml-0 result">
        <div class="row">
            <div class="col-6 result-element">
            ${p1.first_name} ${p1.last_name} 
            </div>
            <div class="col-6 result-element">
            ${p2.first_name} ${p2.last_name}
            </div>     
        </div>
    </div>
    `)
}

const paintPlayersBoard = (players) => {
    let currentContainer = '.players-row-0'
    let rowCounter = 0

    players.forEach(({ first_name, last_name, h_in }, index) => {
        if (index % 20 === 0) {
            rowCounter++
            $('.players-container').append(`
            <div class="row players-row-${rowCounter}"></div>
            `)
            currentContainer = `.players-row-${rowCounter}`
        }
        $(currentContainer).append(`
        <div class="col element player-${index}">
                <p class="lastname">${first_name.charAt(0)} ${last_name}</p>
                <p class="height">${h_in}</p>
            </div>
        `)
    })
}
// Main
(async () => {
    const data = await getData()

    paintPlayersBoard(data.values)

    const FindPairsSingleton = ((arr) => {
        let instance;

        const createInstance = () => {
            validateInput()

            sum = parseInt($('#sum-of-heights').val())
            return findPairsOfPlayers(arr, sum);
        }

        return {
            getInstance: () => {
                if (!instance) {
                    instance = createInstance();
                }
                return instance;
            }
        };
    })(data.values);

    $('#next-button').click((() => {

        let instance = FindPairsSingleton.getInstance()

        instance.next()
        $("#start-animation").attr("disabled", true);
        disable(["#start-animation", '#sum-of-heights'])
    }))

    $('#start-animation').click(async () => {

        validateInput()

        let sum = parseInt($('#sum-of-heights').val())
        let currentFunction = findPairsOfPlayers(data.values, sum)

        disable(["#next-button", "#start-animation", '#sum-of-heights'])
        enable(["#forward-button"])
        await startAnimation(currentFunction)
    })

    $('#refresh-button').click(async () => {
        location.reload()
    })

    $('#forward-button').click((_) => {
        validateInput()

        disable(["#forward-button"])
        animationMS = 0
    })
})()