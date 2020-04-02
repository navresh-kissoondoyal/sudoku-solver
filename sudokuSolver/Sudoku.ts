/**
 * Sudoku solver.
 * @author Navresh Kissoondoyal.
 */
export class Sudoku {
    /**
     * Constructor.
     * @param values Values of the game.
     */
    public constructor(public values: number[][]) {
        this.validate();
    }

    /**
     * Display the game.
     */
    public display() {
        for (let x = 0; x < this.values.length; x++) {
            let row = '';
            for (let y = 0; y < this.values[x].length; y++) {
                if (this.values[x][y] !== 0) {
                    row += this.values[x][y] + ' | ';
                } else {
                    row += '  | ';
                }
            }
            console.log(row);
        }
    }

    /**
     * Solve the game.
     */
    public solve() {
        let haveChangesOccured: boolean = false;
        while (!this.isSolved()) {
            haveChangesOccured = false;
            for (let x = 0; x < this.values.length; x++) {
                for (let y = 0; y < this.values[x].length; y++) {
                    if (this.values[x][y] === 0) {
                        for (let i = 1; i <= 9; i++) {
                            if (this.isValueValidInPosition(x, y, i, true)) {
                                this.values[x][y] = i;
                                haveChangesOccured = true;
                                break;
                            }
                        }
                    }
                }
            }
            if (!haveChangesOccured) {
                break;
            }
        }
        if (!this.isSolved()) {
            // If not solved, try solving by trial and error
            this.solveByTrialAndError();
        }
    }

    /**
     * Solve the game by trial and error.
     */
    private solveByTrialAndError() {
        // Get all unfilled positions
        let unfilledPositions = this.getUnfilledPositions();
        let nextIndex = 0;
        while (true) {
            if (nextIndex > unfilledPositions.length - 1) {
                // Exit the loop if all unfilled positions have been filled
                break;
            }
            let unfilledPosition = unfilledPositions[nextIndex];
            // Make sure the value in unfilled position is zero 
            this.values[unfilledPosition.x][unfilledPosition.y] = 0;

            let valueFound: boolean = false;
            // Try inserting the values from 1 to 9 in the unfilled position
            for (let i = 1; i <= 9; i++) {
                if (!this.isValueTested(unfilledPosition.valuesTested, i)) {
                    // Only tested values that has not already been tested
                    if (this.isValueValidInPosition(unfilledPosition.x, unfilledPosition.y, i, false)) {
                        // The value is valid in the position
                        unfilledPosition.valuesTested.push(i);
                        this.values[unfilledPosition.x][unfilledPosition.y] = i;
                        valueFound = true;
                        break;
                    }
                }
            }
            if (!valueFound) {
                // No value has been found for the position
                if (!this.isSolved()) {
                    // If the game has not been solved, go back to the previous unfilled position so as to test another value in that position
                    this.values[unfilledPosition.x][unfilledPosition.y] = 0;
                    unfilledPosition.valuesTested = [];
                    nextIndex--;
                }
            } else {
                // Check for the next position
                nextIndex++;
            }
        }
    }

    /**
     * Validate the game.
     */
    private validate() {
        if (!this.values ||
            this.values.length !== 9) {
            throw new Error('Invalid game.');
        }
        for (let x = 0; x < this.values.length; x++) {
            if (this.values[x].length !== 9) {
                throw new Error('Invalid game.');
            }
            for (let y = 0; y < this.values[x].length; y++) {
                let value = this.values[x][y];
                if (value !== 0) {
                    if (isNaN(Number(value)) ||
                        value < 0 ||
                        value > 9 ||
                        this.countValueInRow(x, value) > 1 ||
                        this.countValueInColumn(y, value) > 1 ||
                        this.countValueInGroup(x, y, value) > 1) {
                        throw new Error(`Invalid game. Position : (${x},${y})`);
                    }
                }
            }
        }
    }

    /**
     * Get all unfilled positions.
     */
    private getUnfilledPositions(): any[] {
        let unfilledPositions = [];
        for (let x = 0; x < this.values.length; x++) {
            for (let y = 0; y < this.values.length; y++) {
                if (this.values[x][y] === 0) {
                    let position = { x: x, y: y, valuesTested: [] };
                    unfilledPositions.push(position);
                }
            }
        }
        return unfilledPositions;
    }

    /**
     * Check if a value has been tested.
     * @param valuesTested All values already tested.
     * @param value Value to test.
     */
    private isValueTested(valuesTested: number[], value: number) {
        for (let i = 0; i < valuesTested.length; i++) {
            if (valuesTested[i] === value) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if the game has been solved. A game is solved if its values do not has the value zero.
     */
    private isSolved(): boolean {
        for (let x = 0; x < this.values.length; x++) {
            for (let y = 0; y < this.values[x].length; y++) {
                if (this.values[x][y] === 0) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Check if a value is valid in a particular position.
     * @param rowNumber Row number.
     * @param columnNumber Column number.
     * @param value Value to check.
     * @param testOnlyOnePositionInGroup Flag indication if to test only one posiion in a group.
     */
    private isValueValidInPosition(rowNumber: number, columnNumber: number, value: number, testOnlyOnePositionInGroup: boolean): boolean {
        return !this.isValuePresentInRow(rowNumber, value) &&
            !this.isValuePresentInColumn(columnNumber, value) &&
            !this.isValuePresentInGroup(rowNumber, columnNumber, value) &&
            (testOnlyOnePositionInGroup ? this.canValueBeAddedInOnlyOnePositionInGroup(rowNumber, columnNumber, value) : true);
    }

    /**
     * Check if a value is present in a row.
     * @param rowNumber Row number.
     * @param value Value to check.
     */
    private isValuePresentInRow(rowNumber: number, value: number): boolean {
        return this.countValueInRow(rowNumber, value) > 0;
    }

    /**
     * Count how many times a value is present in a row.
     * @param rowNumber Row number.
     * @param value Value to check.
     */
    private countValueInRow(rowNumber: number, value: number): number {
        let row = this.values[rowNumber];
        let count = 0;
        for (let y = 0; y < row.length; y++) {
            if (row[y] === value) {
                count++;
            }
        }
        return count;
    }

    /**
     * Check if a value is present in a column.
     * @param columnNumber Column number.
     * @param value Value to check.
     */
    private isValuePresentInColumn(columnNumber: number, value: number): boolean {
        return this.countValueInColumn(columnNumber, value) > 0;
    }

    /**
     *  Count how many times a value is present in a column.
     * @param columnNumber Column number.
     * @param value Value to check.
     */
    private countValueInColumn(columnNumber: number, value: number): number {
        let count = 0;
        for (let x = 0; x < this.values.length; x++) {
            if (this.values[x][columnNumber] === value) {
                count++;
            }
        }
        return count;
    }

    /**
     * Check if a value is present in a group.
     * @param rowNumber Row number.
     * @param columnNumber Column number.
     * @param value Value to check.
     */
    private isValuePresentInGroup(rowNumber: number, columnNumber: number, value: number): boolean {
        return this.countValueInGroup(rowNumber, columnNumber, value) > 0;
    }

    /**
     * Count how many times a value is present in a group.
     * @param rowNumber Row number.
     * @param columnNumber Column number.
     * @param value Value to check.
     */
    private countValueInGroup(rowNumber: number, columnNumber: number, value: number): number {
        // Calculate the starting position of the group
        let groupX = Math.floor(rowNumber / 3) * 3;
        let groupY = Math.floor(columnNumber / 3) * 3;
        let count = 0;
        for (let x = groupX; x <= groupX + 2; x++) {
            for (let y = groupY; y <= groupY + 2; y++) {
                if (this.values[x][y] === value) {
                    count++;
                }
            }
        }
        return count;
    }

    /**
     * Check whether a value can be added in only one position in a group.
     * @param rowNumber Row number.
     * @param columnNumber Column number.
     * @param value Value to check.
     */
    private canValueBeAddedInOnlyOnePositionInGroup(rowNumber: number, columnNumber: number, value: number): boolean {
        // Calculate the starting position of the group
        let groupX = Math.floor(rowNumber / 3) * 3;
        let groupY = Math.floor(columnNumber / 3) * 3;

        let numberOfPositions: number = 0;
        for (let x = groupX; x <= groupX + 2; x++) {
            for (let y = groupY; y <= groupY + 2; y++) {
                if (this.values[x][y] === 0) {
                    let isValuePresentInRowOrColumn = this.isValuePresentInRow(x, value) ||
                        this.isValuePresentInColumn(y, value);

                    if (!isValuePresentInRowOrColumn) {
                        numberOfPositions++;
                    };
                }
            }
        }
        return (numberOfPositions === 1);
    }
}

function test() {
    let values1 = [
        [4, 1, 0, 0, 6, 0, 0, 7, 8],
        [7, 0, 3, 5, 0, 1, 4, 2, 0],
        [0, 0, 8, 4, 7, 3, 0, 6, 0],
        [0, 5, 0, 0, 9, 4, 8, 3, 0],
        [3, 9, 0, 0, 1, 0, 7, 0, 0],
        [2, 8, 4, 3, 0, 0, 0, 0, 0],
        [6, 0, 0, 0, 0, 0, 0, 8, 0],
        [0, 0, 1, 9, 4, 0, 0, 0, 0],
        [0, 4, 9, 0, 2, 8, 0, 0, 0]
    ];

    let values2 = [
        [0, 0, 0, 2, 6, 0, 7, 0, 1],
        [6, 8, 0, 0, 7, 0, 0, 9, 0],
        [1, 9, 0, 0, 0, 4, 5, 0, 0],
        [8, 2, 0, 1, 0, 0, 0, 4, 0],
        [0, 0, 4, 6, 0, 2, 9, 0, 0],
        [0, 5, 0, 0, 0, 3, 0, 2, 8],
        [0, 0, 9, 3, 0, 0, 0, 7, 4],
        [0, 4, 0, 0, 5, 0, 0, 3, 6],
        [7, 0, 3, 0, 1, 8, 0, 0, 0]
    ];

    let values3 = [
        [0, 2, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 6, 0, 0, 0, 0, 3],
        [0, 7, 4, 0, 8, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 3, 0, 0, 2],
        [0, 8, 0, 0, 4, 0, 0, 1, 0],
        [6, 0, 0, 5, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 7, 8, 0],
        [5, 0, 0, 0, 0, 9, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 4, 0]
    ];

    let values4 = [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ];

    let values5 = [
        [0, 8, 0, 4, 0, 0, 0, 6, 0],
        [5, 0, 0, 0, 0, 8, 0, 0, 3],
        [0, 9, 2, 0, 6, 0, 0, 0, 1],
        [0, 0, 0, 0, 5, 0, 0, 0, 4],
        [0, 0, 0, 3, 0, 6, 0, 1, 0],
        [1, 0, 9, 0, 0, 0, 0, 0, 0],
        [0, 4, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 8, 0, 0, 9, 0, 0],
        [0, 0, 1, 0, 0, 0, 7, 2, 0]
    ];

    let values6 = [
        [0, 0, 2, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 2],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 2, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0, 2, 0, 0]
    ];

    let values7 = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];

    let values8 = [
        [0, 0, 0, 5, 0, 1, 0, 9, 0],
        [5, 0, 2, 0, 8, 0, 7, 0, 0],
        [0, 0, 6, 0, 3, 0, 0, 5, 0],
        [7, 0, 4, 0, 0, 0, 0, 6, 0],
        [0, 2, 0, 0, 0, 0, 0, 8, 0],
        [0, 8, 0, 0, 0, 0, 5, 0, 1],
        [0, 6, 0, 0, 1, 0, 9, 0, 0],
        [9, 0, 8, 0, 4, 0, 1, 0, 6],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];

    let tests = [values1, values2, values3, values4, values5, values6, values7, values8]

    tests.forEach(test => {
        var sudoko: Sudoku = new Sudoku(test);
        sudoko.solve();
        sudoko.display();
        console.log("===================================");
        console.log("===================================");
        console.log("===================================");
    });
}
test();